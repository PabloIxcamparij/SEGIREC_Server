import jwt from "jsonwebtoken";
import { transporter } from "../config/nodemailer.config";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

export const emailNotificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = jwt.verify(
    req.cookies.AuthToken,
    process.env.JWT_SECRET as string
  ) as { id: number;[key: string]: any };

  // Lógica de Notificación (Ejecutada en segundo plano)
  // Utilizamos un bloque try/catch independiente para el envío inicial
  try {
    // Correo de Inicio
    await transporter.sendMail({
      from: process.env.CORREO_USER,
      to: user.email,
      subject: "[Sistema] Proceso de envío de mensajes iniciado",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #1a73e8;">Proceso Iniciado Correctamente</h2>
            <p>Estimado(a) usuario,</p>
            <p>Se ha iniciado un proceso de envío de mensajes a través del sistema. Este proceso continuará su ejecución en segundo plano.</p>
            
            <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Detalles de Inicio</h3>
            <ul style="list-style-type: none; padding: 0;">
                <li><strong>Usuario que Inició:</strong> ID ${user.id}</li>
                <li><strong>Fecha y Hora de Inicio:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Ruta Afectada:</strong> ${req.originalUrl}</li>
            </ul>

            <p style="margin-top: 20px; font-size: 0.9em; color: #777;">Recibirá un correo de resumen al finalizar la tarea.</p>
        </div>
      `,
    });
  } catch (emailStartError) {
    console.error("Error al enviar correo de INICIO:", emailStartError);
  }

  // Ejecutar la acción principal de la ruta inmediatamente
  // Esto asegura que la ruta se ejecute sin esperar correos.
  next();
};