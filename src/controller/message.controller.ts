import { Request, Response } from "express";
import pLimit from "p-limit";
import type {
  Persona,
  PersonaMorosidadAgrupada,
  PersonaPropiedadAgrupada,
} from "../utils/types";
import { groupDataForEmail } from "../utils/groupData";
import { transporter } from "../config/nodemailer.config";
import { generateMassiveTemplate } from "../templates/envioMasivo.template";
import { generateMorosidadTemplate } from "../templates/morosidad.template";
import { generatePropiedadTemplate } from "../templates/propiedades.template";
import { sendWhatsAppMessage } from "../config/whatsApp.config";

// ===================================================================
// Descripcion: Metodos para el envio de mensajes
// ===================================================================

// Nuevo tipo para la función de generación de plantilla
type TemplateGenerator = (
  data: PersonaMorosidadAgrupada | PersonaPropiedadAgrupada | Persona
) => Promise<{ asunto: string; html: string }>;

// ===================================================================
// MÉTODO 1: Envío de correos de MOROSIDAD
// ===================================================================
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

// ===================================================================
// MÉTODO 2: Envío de correos de PROPIEDADES
// ===================================================================
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

// ===================================================================
// MÉTODO 3: Envío de correos de forma masiva
// ===================================================================
export const sendMessageMassive = async (req: Request, res: Response) => {
  const { mensaje, asunto } = req.body;

  // Definimos una función que genera la plantilla HTML
  const templateMasivo: TemplateGenerator = async (persona: Persona) => {
    const html = generateMassiveTemplate(persona, mensaje);
    return { asunto, html };
  };
  console.log(templateMasivo);
  try {
    return handleGroupedMessageSend(
      req,
      res,
      "Masivo",
      templateMasivo as TemplateGenerator
    );
  } catch (error) {
    console.error("Error en sendMessageOfMorosidad:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar mensajes de morosidad." });
  }
};

// ===================================================================
// FUNCIÓN AUXILIAR: Divide el envío en lotes de máximo 50 correos
// ===================================================================
const dividirEnLotes = <T>(array: T[], tamañoLote: number): T[][] => {
  const lotes: T[][] = [];
  for (let i = 0; i < array.length; i += tamañoLote) {
    lotes.push(array.slice(i, i + tamañoLote));
  }
  return lotes;
};

// ===================================================================
// FUNCIÓN AUXILIAR GENERALIZADA: Maneja el proceso de envío
// ===================================================================
const handleGroupedMessageSend = async (
  req: Request,
  res: Response,
  tipo: "Morosidad" | "Propiedad" | "Masivo",
  templateGenerator: TemplateGenerator // Recibimos la función de plantilla
) => {
  const { personas: listaPlana } = req.body as { personas: Persona[] };

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

    const lotes = dividirEnLotes(dataToSend, 50);

    let intentosTotales = 0;
    let enviadosCorrectamentePorCorreo = 0;
    let enviadosCorreactamentePorWhatsApp = 0;

    for (const lote of lotes) {
      try {
        const results = await enviarLoteDeMensajes(lote, templateGenerator);

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
};

// ===================================================================
// FUNCIÓN AUXILIAR: Envía un lote de mensajes con concurrencia limitada
// ===================================================================
const enviarLoteDeMensajes = async (
  items: any[],
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

    // 1. PROMESA DE ENVÍO DE CORREO
    const emailPromise = limit(async () => {
      try {
        const template = await templateGenerator(personaData);

        // Envío de correo (se mantiene igual)
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

    // 2. PROMESA DE ENVÍO DE WHATSAPP (Se mantiene igual)
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
  return await Promise.allSettled(allPromises);
};