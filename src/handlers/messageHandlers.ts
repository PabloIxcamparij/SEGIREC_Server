import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import Deudor from "../models/People.model";
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
export const queryPeople = async (req: Request, res: Response) => {
  try {
    const { ciudad, servicio, deudaMinima, deudaMaxima } = req.body;

    const whereClause: any = {};

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
      attributes: [
        "cedula",
        "nombre",
        "apellido",
        "correo",
        "ciudad",
        "servicio",
        "valorDeLaDeuda",
      ],
      where: whereClause,
      raw: true,
    });

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeople:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

// Endpoint para consultar una persona por su cédula
export const queryPersonByCedula = async (req: Request, res: Response) => {
  try {
    const { cedula } = req.body;

    const persona = await Deudor.findOne({
      attributes: [
        "cedula",
        "nombre",
        "apellido",
        "correo",
        "ciudad",
        "servicio",
        "valorDeLaDeuda",
      ],
      where: { cedula },
      raw: true,
    });

    if (!persona) {
      return res.status(404).json({ error: "Persona no encontrada." });
    }

    return res.status(200).json(persona);
  } catch (error) {
    console.error("Error en queryPerson:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};
// Endpoint para consultar una persona por su nombre
export const queryPersonByName = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un nombre o apellido." });
    }

    const palabras = nombre.trim().split(/\s+/);

    const condiciones = palabras.map((palabra: string) => ({
      [Op.or]: [
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("nombre")), {
          [Op.like]: `%${palabra.toLowerCase()}%`,
        }),
        Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("apellido")), {
          [Op.like]: `%${palabra.toLowerCase()}%`,
        }),
      ],
    }));

    const personas = await Deudor.findAll({
      attributes: [
        "cedula",
        "nombre",
        "apellido",
        "correo",
        "ciudad",
        "servicio",
        "valorDeLaDeuda",
      ],
      where: {
        [Op.and]: condiciones, // exige que todas las palabras coincidan
      },
      raw: true,
    });

    if (!personas || personas.length === 0) {
      return res.status(404).json({ error: "No se encontraron personas." });
    }

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPersonByName:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

// Endpoint para consultar las personas por medio de un archivo
export const queryPeopleByArchive = async (req: Request, res: Response) => {
  try {
    const { cedulas } = req.body;

    // Verificar que el body contenga un array de cédulas
    if (!Array.isArray(cedulas) || cedulas.length === 0) {
      return res.status(400).json({ error: "Debe proporcionar un array de cédulas." });
    }

    const personas = await Deudor.findAll({
      attributes: [
        "cedula",
        "nombre",
        "apellido",
        "correo",
        "ciudad",
        "servicio",
        "valorDeLaDeuda",
      ],
      where: {
        cedula: {
          [Op.in]: cedulas,
        },
      },
      raw: true,
    });

    if (!personas || personas.length === 0) {
      return res.status(404).json({ error: "No se encontraron personas con las cédulas proporcionadas." });
    }

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeopleByFile:", error);
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
