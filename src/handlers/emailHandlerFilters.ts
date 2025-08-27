import { Request, Response } from "express";
import { Op } from "sequelize";
import Deudor from "../models/Personas.model";
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

//Endpoint solo para consultar
export const queryFiltered = async (req: Request, res: Response) => {
  try {
    const { ciudad, servicio, deudaMinima, deudaMaxima } = req.body;
    const whereClause: any = { estadoDeMoratorio: true };

    if (ciudad) whereClause.ciudad = ciudad;
    if (servicio) whereClause.servicio = servicio;

    if (deudaMinima !== undefined) {
      whereClause.valorDeLaDeuda = { [Op.gte]: deudaMinima };
    }
    if (deudaMaxima !== undefined) {
      whereClause.valorDeLaDeuda = {
        ...(whereClause.valorDeLaDeuda || {}),
        [Op.lte]: deudaMaxima,
      };
    }

    const personas = await Deudor.findAll({
      attributes: ["correo", "ciudad", "servicio", "valorDeLaDeuda"],
      where: whereClause,
      raw: true,
    });

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryFiltered:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};


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
