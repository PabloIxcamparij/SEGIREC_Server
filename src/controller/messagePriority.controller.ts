import { Request, Response } from "express";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { generatePriorityToken } from "../utils/jwt";
import { transporter } from "../config/nodemailer.config";
import {
  generateAndStoreCodeFor,
  verifyCodeFor,
  getCodeEntry,
  clearCodeStoreFor,
} from "../utils/codeStore";

import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

interface AuthRequest extends Request {
  currentUser?: { id: string | number; email?: string };
}

/**
 * Busca el primer usuario válido con rol de administrador.
 * @returns {Promise<User|null>} El usuario administrador encontrado o null si no hay ninguno.
 */

const findFirstValidAdmin = async () => {
  // Buscar el primer usuario con Rol 'Administrador', Activo=true, y Eliminado=false.
  const adminUser = await User.findOne({
    where: {
      Rol: { [Op.like]: "%Administrador%" },
      Activo: true,
    },
    order: [["createdAt", "ASC"]], //Ordena para asegurar la consistencia (ej. por fecha de creación)
  });

  return adminUser;
};

/**
 * Solicita un código de verificación para envío prioritario.
 * @param req WhattsApp y priority en el body.
 * @param res Confirma el envío del código o error.
 * @returns Message de éxito o error.
 */

export const requestCodePrioritaryMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {

    // Verificar usuario autenticado
    const user = jwt.verify(
      req.cookies.AuthToken,
      process.env.JWT_SECRET as string
    ) as { id: number; [key: string]: any };

    if (!user)
      return res.status(401).json({ error: "Usuario no autenticado." });

    const { whatsApp = false, priority = false } = req.body ?? {};

    if (!whatsApp && !priority) {
      return res
        .status(400)
        .json({ error: "Debe seleccionar al menos una opción." });
    }

    // Validación mínima: debe activarse al menos una opción para solicitar código
    if (!whatsApp && !priority) {
      return res.status(400).json({
        error: "Debe seleccionar al menos una opción (whatsApp o priority).",
      });
    }

    // Buscar al primer administrador válido
    const adminUser = await findFirstValidAdmin();

    if (!adminUser) {
      return res.status(500).json({
        error:
          "No se encontró un administrador activo y válido para enviar el código.",
      });
    }

    const adminEmail = adminUser.Correo;

    // Generar y almacenar el código (el helper también guardará las opciones)
    const verificationCode = generateAndStoreCodeFor(user.id, adminEmail, {
      whatsApp,
      priority,
    });

    // Preparar correo
    const template = {
      asunto: "Código de Verificación para Envío Prioritario",
      html: `
                <h1>Verificación de Seguridad</h1>
                <p>Usted ha solicitado realizar un Envío Prioritario de mensajes.</p>
                <p>Su código de verificación es:</p>
                <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f0f0f0; border-radius: 5px; display: inline-block;">
                    ${verificationCode}
                </div>
                <p>Este código expira en 5 minutos.</p>
            `,
    };

    await transporter.sendMail({
      from: process.env.CORREO_USER,
      to: adminEmail, // Usar el correo del administrador encontrado
      subject: template.asunto,
      html: template.html,
    });

    return res.status(200).json({
        message: "Código de verificación enviado exitosamente al administrador.",
    });

  } catch (error) {
    console.error("Error al solicitar el código prioritario:", error);

    if (error.message && error.message.includes("transporter")) {
      return res.status(500).json({
        error:
          "Fallo al enviar el correo con el código de seguridad. Verifique la configuración del transportador.",
      });
    }
    return res
      .status(500)
      .json({ error: "Ocurrió un error interno del servidor." });
  }
};

/**
 * Confirmacion del código para envío prioritario.
 * @param req Codigo en el body.
 * @param res Token de envío prioritario/WhatsApp o error.
 * @returns Message de éxito con token o error. Token válido por 60 segundos.
 */

export const confirmCodePrioritaryMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {

   // Verificar usuario autenticado
    const user = jwt.verify(
      req.cookies.AuthToken,
      process.env.JWT_SECRET as string
    ) as { id: number; [key: string]: any };
    
    if (!user)
      return res.status(401).json({ error: "Usuario no autenticado." });

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Código requerido." });

    // Verificar para este usuario
    const verificationResult = verifyCodeFor(user.id, code);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        error: verificationResult.error,
        attemptsRemaining: verificationResult.attemptsRemaining ?? null,
      });
    }

    // Recuperar la entrada para sacar adminEmail y opciones
    const entry = getCodeEntry(user.id);
    if (!entry) {
      return res
        .status(400)
        .json({ success: false, error: "Entrada no encontrada." });
    }

    const adminUser = await findFirstValidAdmin();
    if (!adminUser) {
      clearCodeStoreFor(user.id);
      return res
        .status(500)
        .json({ success: false, error: "No se encontró administrador." });
    }

    // Generar token con userId (solicitante) y las opciones guardadas
    const { whatsApp = false, priority = false } = entry.pendingOptions;

    const priorityToken = generatePriorityToken(user.id, entry.adminEmail, {
      priority,
      whatsApp,
    });

    // Limpiar solo la entrada del userId
    clearCodeStoreFor(user.id);

    // Devolvemos el éxito y el token
    return res.status(200).json({
      success: true,
      message:
        "Código verificado correctamente. Token de envío prioritario emitido.",
      token: priorityToken,
      options: { priority, whatsApp },
    });
  } catch (error) {
    console.error("Error al confirmar el código prioritario:", error);
    return res
      .status(500)
      .json({ error: "Ocurrió un error interno del servidor." });
  }
};
