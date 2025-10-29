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

// ===================================================================
// Descripcion: Metodos para el envio de mensajes
// ===================================================================

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
// FUNCIÓN AUXILIAR: Envía un lote de correos con concurrencia limitada
// Se modificó para registrar errores y devolver el estado de cada promesa.
// ===================================================================
const enviarLoteDeCorreos = async (
  items: any[],
  tipo: "Morosidad" | "Propiedad"
) => {
  const limit = pLimit(5);

  const mailPromises = items.map((groupedItem) => {
    const personaData = groupedItem.data; // La generación de la plantilla es una promesa que se ejecuta inmediatamente.
    const templatePromise = (async () => {
      try {
        if (tipo === "Morosidad") {
          return await generateMorosidadTemplate(
            personaData as PersonaMorosidadAgrupada
          );
        } else {
          return await generatePropiedadTemplate(
            personaData as PersonaPropiedadAgrupada
          );
        }
      } catch (error) {
        // MUY IMPORTANTE: Registra el error si la plantilla falla (ej: error de DB o Handlebars)
        console.error(
          `[Error Plantilla - ${tipo}] Falló para ${personaData.cedula}:`,
          error
        );
        throw new Error(`Template generation failed for ${personaData.cedula}`); // Rechazar para que se detecte como fallo
      }
    })(); // Retorna la promesa de envío de correo

    return limit(async () => {
      try {
        // Esperar la plantilla (si falló antes, el error se propaga aquí)
        const { asunto: mailSubject, html: mailHtml } = await templatePromise; // Enviar correo
        await transporter.sendMail({
          from: "j.pablo.sorto@gmail.com",
          to: "j.pablo.sorto@gmail.com", // Usar to: personaData.correo si está listo
          subject: mailSubject,
          html: mailHtml,
        });
        return "Correo enviado correctamente"; // Estado de éxito
      } catch (err) {
        // MUY IMPORTANTE: Capturar errores de envío de correo (Nodemailer) o de la plantilla
        console.error(
          `[Error Envío - ${tipo}] Falló para ${personaData.cedula}:`,
          err
        );
        throw err; // Rechazar para que Promise.allSettled lo detecte
      }
    });
  }); // Usamos Promise.allSettled() para obtener el resultado de cada promesa.

  return await Promise.allSettled(mailPromises);
};

// ===================================================================
// MÉTODO 1: Envío de correos de MOROSIDAD
// ===================================================================
export const sendMessageOfMorosidad = async (req: Request, res: Response) => {
  try {
    const { personas: listaPlana } = req.body as { personas: Persona[] };
    
    if (!Array.isArray(listaPlana) || listaPlana.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe enviar una lista de personas válida." });
    }

    const dataToSend = groupDataForEmail(listaPlana).filter(
      (d) => d.tipo === "Morosidad"
    );

    const lotes = dividirEnLotes(dataToSend, 50);
    let intentosTotales = 0;
    let enviadosCorrectamentePorCorreo = 0;
    let enviadosCorreactamentePorWhatsApp = 0;

    for (const [index, lote] of lotes.entries()) {
      try {
        // La función ahora devuelve el resultado de Promise.allSettled
        const results = await enviarLoteDeCorreos(lote, "Morosidad"); // Contar resultados exitosos
        const successes = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        enviadosCorrectamentePorCorreo += successes;
        intentosTotales += lote.length; // Se intentó enviar la longitud del lote
      } catch (err) {
        console.error("Error catastrófico en el proceso de lotes:", err);
      }
    } // De uso para el middleware
    res.locals.actividad = {
      numeroDeMensajes: intentosTotales,
      numeroDeCorreosEnviados: enviadosCorrectamentePorCorreo,
      numeroDeWhatsAppEnviados: enviadosCorreactamentePorWhatsApp,
    };

    return res.status(200).json({
      message: `Proceso de Morosidad finalizado. Intentos: ${intentosTotales}, Éxitos: ${enviadosCorrectamentePorCorreo}.`,
      total_lotes: lotes.length,
      correos_enviados: enviadosCorrectamentePorCorreo,
    });

  } catch (error) {
    console.error("Error en sendEmailsMorosidad:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar correos de morosidad." });
  }
};

// ===================================================================
// MÉTODO 2: Envío de correos de PROPIEDADES
// ... (Se aplica la misma corrección de lógica de conteo, pero no se muestra aquí para brevedad)
// ===================================================================
export const sendMessageOfPropiedades = async (req: Request, res: Response) => {
  try {
    const { personas: listaPlana } = req.body as { personas: Persona[] };

    if (!Array.isArray(listaPlana) || listaPlana.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe enviar una lista de personas válida." });
    }

    const dataToSend = groupDataForEmail(listaPlana).filter(
      (d) => d.tipo === "Propiedad"
    );

    console.log(
      `Iniciando envío de Propiedades para ${dataToSend.length} destinatarios agrupados.`
    );

    const lotes = dividirEnLotes(dataToSend, 50);
    let intentosTotales = 0;
    let enviadosCorrectamentePorCorreo = 0;
    let enviadosCorreactamentePorWhatsApp = 0;

    for (const [index, lote] of lotes.entries()) {
      console.log(
        `Enviando lote ${index + 1} de ${lotes.length} (Propiedades) con ${
          lote.length
        } correos...`
      );

      try {
        const results = await enviarLoteDeCorreos(lote, "Propiedad");
        const successes = results.filter(
          (r) => r.status === "fulfilled"
        ).length;

        enviadosCorrectamentePorCorreo += successes;
        intentosTotales += lote.length;

        console.log(
          `Lote ${index + 1} finalizado. Éxitos: ${successes}, Fallos: ${
            lote.length - successes
          }`
        );
      } catch (err) {
        console.error("Error catastrófico en el proceso de lotes:", err);
      }
    } // De uso para el middleware

    res.locals.actividad = {
      numeroDeMensajes: intentosTotales,
      numeroDeCorreosEnviados: enviadosCorrectamentePorCorreo,
      numeroDeWhatsAppEnviados: enviadosCorreactamentePorWhatsApp,
    };

    return res.status(200).json({
      message: `Proceso de Propiedades finalizado. Intentos: ${intentosTotales}, Éxitos: ${enviadosCorrectamentePorCorreo}.`,
      total_lotes: lotes.length,
    });
  } catch (error) {
    console.error("Error en sendEmailsPropiedades:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar correos de propiedades." });
  }
};

// ===================================================================
// MÉTODO 3: Envío de correos de forma masiva
// ... (No se toca, ya que su lógica de conteo es diferente)
// ===================================================================
export const sendMessageMassive = async (req: Request, res: Response) => {
  try {
    const { personas: listaPlana } = req.body as { personas: Persona[] };
    const { mensaje, asunto } = req.body;

    if (!Array.isArray(listaPlana) || listaPlana.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe enviar una lista de personas válida." });
    }

    const lotes = dividirEnLotes(listaPlana, 50);

    let enviados = 0;
    let enviadosCorrectamentePorCorreo = 0;
    let enviadosCorrectamentePorWhatsApp = 0;

    for (const [index, lote] of lotes.entries()) {
      console.log(`Enviando lote ${index + 1} de ${lotes.length} (Masivo)...`);

      const limit = pLimit(5);

      const mailPromises = lote.map((persona) => {
        const emailHtml = generateMassiveTemplate(persona, mensaje);

        return limit(async () => {
          try {
            await transporter.sendMail({
              from: "j.pablo.sorto@gmail.com", // to: persona.correo || "j.pablo.sorto@gmail.com",
              to: "j.pablo.sorto@gmail.com",
              subject: asunto,
              html: emailHtml,
            });
            enviadosCorrectamentePorCorreo++;
          } catch (error) {
            console.error(`Error enviando correo a ${persona.nombre}:`, error);
          } finally {
            enviados++; // se cuenta siempre, exitoso o no
          }
        });
      });

      await Promise.allSettled(mailPromises);
    } // Registrar actividad para el middleware

    res.locals.actividad = {
      numeroDeMensajes: enviados,
      numeroDeCorreosEnviados: enviadosCorrectamentePorCorreo,
      numeroDeWhatsAppEnviados: enviadosCorrectamentePorWhatsApp,
    };

    return res.status(200).json({
      message: `Se intentaron enviar ${enviados} correos en ${lotes.length} lote(s). 
                Éxitos: ${enviadosCorrectamentePorCorreo}`,
      total_lotes: lotes.length,
    });
  } catch (error) {
    console.error("Error en sendMessageMassive:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar correos de propiedades." });
  }
};
