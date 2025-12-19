import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import pLimit from "p-limit";
import type {
  Persona,
  PersonaMorosidadAgrupada,
  PersonaPropiedadAgrupada,
} from "../utils/types";

// Configuraciones de envío
import { transporter } from "../config/nodemailer.config";
import { sendWhatsAppMessage } from "../config/whatsApp.config";

// Templates
import { generateMassiveTemplate } from "../templates/envioMasivo.template";
import { generateMorosidadTemplate } from "../templates/morosidad.template";
import { generatePropiedadTemplate } from "../templates/propiedades.template";

// Utilidades
import { withRetry } from "../utils/MesaageControllerRetryHandler";
import { groupDataForEmail } from "../utils/MessageControllerGroupData";
import { guardarRegistroEnvio } from "../utils/MessageControllerActividadDb";
import { enviarCorreoResumenFinal } from "../utils/MessageControllerNotificacionesEnvio";

// Cargar variables de entorno
import dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

// ===================================================================
// Descripción general
// -------------------------------------------------------------------
// Este módulo contiene los métodos para enviar mensajes de Morosidad,
// Propiedades y Masivos, manejando la agrupación de datos, la generación
// de plantillas y el envío concurrente con limitación.
// ===================================================================

// Nuevo tipo para la función de generación de plantilla
type TemplateGenerator = (
  data: PersonaMorosidadAgrupada | PersonaPropiedadAgrupada | Persona
) => Promise<{ asunto: string; html: string }>;

/**
 * Envía mensajes de Morosidad a una lista de personas.
 * @param req Lista de personas.
 * @param res
 * @returns
 */
export const sendMessageOfMorosidad = (req: Request, res: Response) => {
  try {
    return handleGroupedMessageSend(
      req,
      res,
      "Morosidad",
      generateMorosidadTemplate as TemplateGenerator
    );
  } catch (error) {
    console.error("Error en sendMessageOfMorosidad:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar mensajes de morosidad." });
  }
};

/**
 * Envía mensajes de propiedades a una lista de personas.
 * @param req Lista de personas.
 * @param res
 * @returns
 */
export const sendMessageOfPropiedades = (req: Request, res: Response) => {
  try {
    return handleGroupedMessageSend(
      req,
      res,
      "Propiedad",
      generatePropiedadTemplate as TemplateGenerator
    );
  } catch (error) {
    console.error("Error en sendMessageOfPropiedades:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar mensajes de propiedades." });
  }
};

/**
 * Envía mensajes masivos a una lista de personas.
 * @param req Mensaje, asunto y lista de personas.
 * @param res
 * @returns
 */
export const sendMessageMassive = async (req: Request, res: Response) => {
  const { mensaje, asunto } = req.body;

  // Definimos una función que genera la plantilla HTML
  const templateMasivo: TemplateGenerator = async (persona: Persona) => {
    const html = generateMassiveTemplate(persona, mensaje);
    return { asunto, html };
  };

  try {
    return handleGroupedMessageSend(
      req,
      res,
      "Masivo",
      templateMasivo as TemplateGenerator
    );
  } catch (error) {
    console.error("Error en sendMessageMassive:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar mensajes de masivo." });
  }
};

// --------------------------------------------------------------------
// Funciones auxiliares para los métodos de envío de mensajes
// --------------------------------------------------------------------

/**
 * Metodo para dividir un array en lotes de tamaño específico.
 * @param array Array de elementos a dividir en lotes.
 * @param tamañoLote Tamaño máximo de cada lote.
 * @returns Regresa un array de arrays, cada uno con el tamaño especificado (excepto posiblemente el último).
 */
const dividirEnLotes = <T>(array: T[], tamañoLote: number): T[][] => {
  const lotes: T[][] = [];
  for (let i = 0; i < array.length; i += tamañoLote) {
    lotes.push(array.slice(i, i + tamañoLote));
  }
  return lotes;
};

/**
 * Manejo generalizado del envío de mensajes agrupados.
 * @param req
 * @param res
 * @param tipo
 * @param templateGenerator
 * @returns resumen del proceso de envío.
 */

const handleGroupedMessageSend = async (
  req: Request,
  res: Response,
  tipo: "Morosidad" | "Propiedad" | "Masivo",
  templateGenerator: TemplateGenerator // Recibimos la función de plantilla
) => {
  const { personas: listaPlana } = req.body as { personas: Persona[] };

  //Obtener usuario desde el token
  const user = jwt.verify(req.cookies.AuthToken, process.env.JWT_SECRET as string) as any;

  // Obtener las opciones de envío desde el token de prioridad
  const priorityToken = req.body.priorityToken;
  const { priorityAccess, sendWhatsApp } = verifyPriorityToken(priorityToken);

  if (!Array.isArray(listaPlana) || listaPlana.length === 0) {
    return res
      .status(400)
      .json({ error: "Debe enviar una lista de personas válida." });
  }

  let dataToSend = [];

  // Filtrado de datos
  if (tipo !== "Masivo") {
    dataToSend = groupDataForEmail(listaPlana).filter((d) => d.tipo === tipo);
  } else {
    dataToSend = listaPlana;
  }

  const lotes = dividirEnLotes(dataToSend, 50);

  if (lotes.length > 4 && !priorityAccess) {
    console.warn(`[AVISO] Se generaron más de 2 lotes para ${tipo}.`);
    return res.status(400).json({
      error: `El envío de mensajes está limitado a 4 lotes de 50 mensajes cada uno (200 en total). Actualmente hay ${lotes.length} lotes.`,
    });
  }

  // RESPUESTA INMEDIATA AL CLIENTE
  // Esto evita el timeout. El proceso sigue en el servidor.
  res.status(202).json({
    message: `Proceso de ${tipo} iniciado. Recibirá un correo con el resumen al finalizar.`,
    totalLotes: lotes.length
  });

  // ENVÍO ASÍNCRONO DE MENSAJES

  (async () => {
    let intentosTotales = 0;
    let exitosCorreo = 0;
    let exitosWhatsApp = 0;
    let resultadosIndividuales: any[] = [];
    const asunto = tipo === "Masivo" ? req.body.asunto : "Notificación Sistema";

    for (const lote of lotes) {
      try {
        const { rawResults, personas } = await enviarLoteDeMensajes(lote, sendWhatsApp, asunto, templateGenerator);

        // Procesar resultados del lote
        rawResults.forEach((result: any, i: number) => {
          if (result.status === "fulfilled" && result.value?.ok) {
            if (result.value.target === "correo") exitosCorreo++;
            if (result.value.target === "whatsapp") exitosWhatsApp++;
          }
        });

        // Mapear resultados individuales
        personas.forEach((p: any, i: number) => {
          const persona = p.data ?? p;
          const offset = sendWhatsApp ? 2 : 1;
          const resCorreo = rawResults[i * offset];
          const resWA = sendWhatsApp ? rawResults[i * offset + 1] : null;

          resultadosIndividuales.push({
            nombre: persona.nombre,
            cedula: persona.cedula,
            telefono: persona.telefono,
            correo: persona.correo,
            correo_ok: resCorreo?.status === "fulfilled" && (resCorreo.value as any).ok,
            whatsapp_ok: sendWhatsApp ? (resWA?.status === "fulfilled" && (resWA.value as any).ok) : null
          });
        });

        intentosTotales += lote.length;
      } catch (err) {
        console.error(`Fallo crítico en lote de ${tipo}:`, err);
      }
    }

    // FINALIZACIÓN: Guardar en DB y Enviar Email
    const resumen = { intentosTotales, exitosCorreo, exitosWhatsApp, resultadosIndividuales, tipo };
    await guardarRegistroEnvio(user.id, tipo, resumen);
    await enviarCorreoResumenFinal(user.email, resumen);

  })().catch(err => console.error("Error en proceso de fondo:", err));

};

/**
 * Envía un lote de mensajes (correo y opcionalmente WhatsApp) con concurrencia limitada.
 * @param items Lista de items a procesar.
 * @param sendWhatsApp parámetro que indica si se debe enviar WhatsApp.
 * @param templateGenerator función para generar la plantilla de correo.
 * @returns resultados de las promesas de envío.
 */

const enviarLoteDeMensajes = async (
  items: any[],
  sendWhatsApp: boolean,
  asunto: string,
  templateGenerator: TemplateGenerator
) => {
  const limit = pLimit(5); // Limitar a 5 envíos concurrentes, esto ayuda a no saturar el servidor SMTP y evitar bloqueos por spam.
  const allPromises: Promise<any>[] = [];

  for (const groupedItem of items) {
    const personaData = groupedItem.data ?? groupedItem;

    // Saltar si no hay datos de persona
    if (!personaData) continue;

    // EMAIL

    if (personaData.correo) {
      allPromises.push(limit(() =>
        withRetry(async () => {
          const template = await templateGenerator(personaData);
          await transporter.sendMail({
            from: process.env.CORREO_USER,
            to: personaData.correo,
            subject: template.asunto,
            html: template.html,
          });
          return { target: "correo", ok: true, persona: personaData };
        }, 3) // 3 intentos para correo
          .catch(err => ({ target: "correo", ok: false, error: err.message, persona: personaData }))
      ));
    }

    // WHATSAPP
    if (sendWhatsApp && personaData.telefono) {
      allPromises.push(limit(() =>
        withRetry(async () => {
          await sendWhatsAppMessage(personaData.telefono, asunto);
          return { target: "whatsapp", ok: true, persona: personaData };
        }, 2, 3000) // 2 intentos para WA (son más sensibles a bloqueos)
          .catch(err => ({ target: "whatsapp", ok: false, error: err.message, persona: personaData }))
      ));
    }
  }

  return {
    rawResults: await Promise.allSettled(allPromises),
    personas: items,
  };
};

/**
 * Verifica el token de prioridad y devuelve un objeto con las propiedades
 * @param token Token JWT de prioridad.
 * @returns Objeto con las propiedades priorityAccess y sendWhatsApp.
 */
const verifyPriorityToken = (token: string | null) => {
  if (!token) return { priorityAccess: false, sendWhatsApp: false };

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
    return {
      priorityAccess: decoded.priorityAccess === true,
      sendWhatsApp: decoded.sendWhatsApp === true,
    };
  } catch {
    return { priorityAccess: false, sendWhatsApp: false };
  }
};
