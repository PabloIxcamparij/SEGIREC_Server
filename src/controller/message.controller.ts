import jwt from 'jsonwebtoken';
import { Request, Response } from "express";
import pLimit from "p-limit";
import type {
  Persona,
  PersonaMorosidadAgrupada,
  PersonaPropiedadAgrupada,
} from "../utils/types";
import { groupDataForEmail } from "../utils/groupData";
import { transporter } from "../config/nodemailer.config";
import { sendWhatsAppMessage } from "../config/whatsApp.config";
import { generateMassiveTemplate } from "../templates/envioMasivo.template";
import { generateMorosidadTemplate } from "../templates/morosidad.template";
import { generatePropiedadTemplate } from "../templates/propiedades.template";

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
  const priorityToken = req.body.priorityToken; 
    
const { priorityAccess, sendWhatsApp } = verifyPriorityToken(priorityToken);

  if (!Array.isArray(listaPlana) || listaPlana.length === 0) {
    return res
      .status(400)
      .json({ error: "Debe enviar una lista de personas válida." });
  }

  let dataToSend = [];
  // Filtrado de datos (se mantiene)
  if (tipo !== "Masivo") {
    dataToSend = groupDataForEmail(listaPlana).filter((d) => d.tipo === tipo);
  } else {
    dataToSend = listaPlana;
  }
    const lotes = dividirEnLotes(dataToSend, 2);

    if (lotes.length > 1 && !priorityAccess) {
      console.warn(`[AVISO] Se generaron más de 2 lotes para ${tipo}.`);
      return res.status(400).json({
        error: `El envío de mensajes está limitado a 2 lotes de 50 mensajes cada uno (100 en total). Actualmente hay ${lotes.length} lotes.`,
      });
    }

    let intentosTotales = 0;
    let enviadosCorrectamentePorCorreo = 0;
    let enviadosCorreactamentePorWhatsApp = 0;

    for (const lote of lotes) {
      try {
        const results = await enviarLoteDeMensajes(lote, sendWhatsApp, templateGenerator);

        results.forEach((r, index) => {
          if (r.status === "fulfilled") {
            if (index % 2 === 0) {
              // Asumiendo que el índice par es Correo y el impar es WhatsApp
              enviadosCorrectamentePorCorreo++;
            } else {
              enviadosCorreactamentePorWhatsApp++;
            }
          }
        });
        intentosTotales += lote.length;
      } catch (err) {
        console.error("Error catastrófico en el proceso de lotes:", err);
      }
    }

    // De uso para el middleware
    res.locals.actividad = {
      numeroDeMensajes: intentosTotales,
      numeroDeCorreosEnviados: enviadosCorrectamentePorCorreo,
      numeroDeWhatsAppEnviados: enviadosCorreactamentePorWhatsApp,
    };

    return res.status(200).json({
      message: `Proceso de ${tipo} finalizado. Intentos: ${intentosTotales}, Correos Éxito: ${enviadosCorrectamentePorCorreo}, WhatsApp Éxito: ${enviadosCorreactamentePorWhatsApp}.`,
    });
  }

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
  templateGenerator: TemplateGenerator
): Promise<PromiseSettledResult<string>[]> => {
  const limit = pLimit(5);

  const allPromises: Promise<any>[] = [];

  for (const groupedItem of items) {
    
    const personaData = groupedItem.data ?? groupedItem;

    if (!personaData) {
      console.warn(`[AVISO] Item inválido, sin datos de persona:`, groupedItem);
      continue;
    }

    // Envío de correo. Siempre se hace.
    const emailPromise = limit(async () => {
      try {
        const template = await templateGenerator(personaData);

        await transporter.sendMail({
          from: "j.pablo.sorto@gmail.com",
          to: "j.pablo.sorto@gmail.com",
          subject: template.asunto,
          html: template.html,
        });

        return "Correo enviado correctamente";
      } catch (err) {
        console.error(`[Error CORREO] Falló:`, err);
        throw new Error(`Email failed `);
      }
    });
    allPromises.push(emailPromise);

    // Envío de WhatsApp. Se envia unicamente si el token lo permite.
    if (sendWhatsApp) {
      
    const whatsappPromise = limit(async () => {
      try {
        return await sendWhatsAppMessage(
          "50687775340",
          "hello_world",
          personaData
        );
      } catch (err) {
        console.error(`[Error WHATSAPP] Falló:`, err);
        throw new Error(`WhatsApp failed`);
      }
    });
    allPromises.push(whatsappPromise);
  }

  }
  return await Promise.allSettled(allPromises);
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
