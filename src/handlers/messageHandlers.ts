import { Request, Response } from "express";
import nodemailer from "nodemailer";
import pLimit from "p-limit";

// Config transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para 465, false para 587
  auth: {
    user: "j.pablo.sorto@gmail.com",
    pass: "zqzy qybh fpvk lsgi",
  },
});

// Endpoint para enviar correos
export const sendEmails = async (req: Request, res: Response) => {
  try {
    const { destinatarios } = req.body; // Array de correos

    if (!Array.isArray(destinatarios) || destinatarios.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe enviar una lista de correos válida." });
    }

    const limit = pLimit(5);
    const mailPromises = destinatarios.map((correo) =>
      limit(() =>
        transporter.sendMail({
          from: "j.pablo.sorto@gmail.com",
          to: correo,
          subject: "Aviso de cobro pendiente",
          text: "Estimado(a) usuario(a), le informamos que tiene un cobro pendiente.",
        })
      )
    );

    await Promise.all(mailPromises);

    return res.status(200).json({
      message: `Correos enviados correctamente a ${destinatarios.length} personas.`,
      destinatarios,
    });
  } catch (error) {
    console.error("Error en sendEmails:", error);
    return res.status(500).json({ error: "Error al enviar correos." });
  }
};

//EndPoint para enviar whatsapps (No implementado)
// Número de WhatsApp asociado a tu app (PHONE_NUMBER_ID)
const PHONE_NUMBER_ID = "734416859760076";

// Token generado en Meta Developer
const TOKEN =
  "EAAaZCpiMPZAK4BPV0mNUsL3l4D9zK5ZBZBDpRAVBGZCIGUIyW2HXumrKZAwdYplhFWFOiA9glEpwVxFKNvpNhNIziONQzuGoxa8IZBITTJIBHsQBISKDpwjAOfKRKVhw986AwaDuRkjbPkUm8ZBCqwBfLD5ZCGcHOsHKUcJNCnzPfF5BbYPlXxewLB3zEXBMZByVrDWlzywoDFa3CtwJXFCbEg6wwZCMI7ZCQeMYefJVrBgq0LsZD"; // ⚠️ no hardcodear en producción

export const sendWhatsApps = async (req: Request, res: Response) => {
  try {
    const { numeros } = req.body; // Array de números E.164 (ej: "50687775340")

    if (!Array.isArray(numeros) || numeros.length === 0) {
      return res
        .status(400)
        .json({ error: "Debes enviar un array de números" });
    }

    const results = [];

    for (const numero of numeros) {
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: numero,
            type: "template",
            template: {
              name: "hello_world", // Debe estar aprobado en tu app
              language: { code: "en_US" },
            },
          }),
        }
      );

      const data = await response.json();
      results.push({ numero, data });
    }

    return res.json({ success: true, results });
  } catch (error) {
    console.error("Error en sendWhatsApps:", error);
    return res.status(500).json({ error: "Error al enviar WhatsApps." });
  }
};
