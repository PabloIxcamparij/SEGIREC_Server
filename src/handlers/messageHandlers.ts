import { Request, Response } from "express";
import pLimit from "p-limit";
import type {
  Persona,
  PersonaMorosidadAgrupada,
  PersonaPropiedadAgrupada,
} from "../utils/types";
import { groupDataForEmail } from "../utils/groupData";
import { transporter } from "../utils/nodemailer.config";
import { generateMassiveTemplate } from "../templates/envioMasivo.template";
import { generateMorosidadTemplate } from "../templates/morosidad.template";
import { generatePropiedadTemplate } from "../templates/propiedades.template";

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
// ===================================================================
const enviarLoteDeCorreos = async (
  items: any[],
  tipo: "Morosidad" | "Propiedad"
) => {
  const limit = pLimit(5);

  const mailPromises = items.map((groupedItem) => {
    const personaData = groupedItem.data;
    let emailHtml: string;
    let subject: string;

    if (tipo === "Morosidad") {
      emailHtml = generateMorosidadTemplate(
        personaData as PersonaMorosidadAgrupada
      );
      subject =
        "Notificación de Estado de Cuenta de Morosidad - Municipalidad de Bagaces";
    } else if (tipo === "Propiedad") {
      emailHtml = generatePropiedadTemplate(
        personaData as PersonaPropiedadAgrupada
      );
      subject =
        "Notificación de Fincas Omisas de Declaración - Municipalidad de Bagaces";
    }

    return limit(() =>
      transporter.sendMail({
        from: "j.pablo.sorto@gmail.com",
        // to: personaData.correo || "j.pablo.sorto@gmail.com",
        to: "j.pablo.sorto@gmail.com",
        subject,
        html: emailHtml,
      })
    );
  });

  await Promise.all(mailPromises);
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

    // Filtrar y agrupar solo las personas con servicio (morosidad)
    const dataToSend = groupDataForEmail(listaPlana).filter(
      (d) => d.tipo === "Morosidad"
    );

    const lotes = dividirEnLotes(dataToSend, 50);
    let enviados = 0;

    for (const [index, lote] of lotes.entries()) {
      console.log(
        `Enviando lote ${index + 1} de ${lotes.length} (Morosidad)...`
      );
      await enviarLoteDeCorreos(lote, "Morosidad");
      enviados += lote.length;
    }

    return res.status(200).json({
      message: `Se enviaron ${enviados} correos de Morosidad en ${lotes.length} lote(s).`,
      total_lotes: lotes.length,
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

    const lotes = dividirEnLotes(dataToSend, 50);
    let enviados = 0;
    let enviadosCorrectamentePorCorreo = 0;
    let enviadosCorreactamentePorWhatsApp = 0;

    for (const [index, lote] of lotes.entries()) {
      console.log(
        `Enviando lote ${index + 1} de ${lotes.length} (Propiedades)...`
      );

      try {
        await enviarLoteDeCorreos(lote, "Propiedad");
        enviadosCorrectamentePorCorreo += lote.length;
      } catch (err) {
        console.error("Error en lote:", err);
      }

      enviados += lote.length;
    }

    // De uso para el middleware
    res.locals.actividad = {
      numeroDeMensajes: enviados,
      numeroDeCorreosEnviados: enviadosCorrectamentePorCorreo,
      numeroDeWhatsAppEnviados: enviadosCorreactamentePorWhatsApp,
    };

    return res.status(200).json({
      message: `Se enviaron ${enviadosCorrectamentePorCorreo}/${enviados} correos de Propiedades en ${lotes.length} lote(s).`,
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

    for (const [index, lote] of lotes.entries()) {
      console.log(`Enviando lote ${index + 1} de ${lotes.length} (Masivo)...`);

      const limit = pLimit(5);

      const mailPromises = lote.map((persona) => {
        let emailHtml: string;
        let subject: string;
        emailHtml = generateMassiveTemplate(persona, mensaje);

        return limit(() =>
          transporter.sendMail({
            from: "j.pablo.sorto@gmail.com",
            // to: personaData.correo || "j.pablo.sorto@gmail.com",
            to: "j.pablo.sorto@gmail.com",
            subject: asunto,
            html: emailHtml,
          })
        );
      });

      await Promise.all(mailPromises);

      enviados += lote.length;
    }

    return res.status(200).json({
      message: `Se enviaron ${enviados} correos de Propiedades en ${lotes.length} lote(s).`,
      total_lotes: lotes.length,
    });
  } catch (error) {
    console.error("Error en sendEmailsPropiedades:", error);
    return res
      .status(500)
      .json({ error: "Error al enviar correos de propiedades." });
  }
};
