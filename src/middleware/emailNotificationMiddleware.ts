import jwt from "jsonwebtoken";
import { transporter } from "../config/nodemailer.config";
import { Request, Response, NextFunction } from "express";

export const emailNotificationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = jwt.verify(
    req.cookies.AuthToken,
    process.env.JWT_SECRET as string
  ) as { id: number; [key: string]: any };

  // Lógica de Notificación (Ejecutada en segundo plano)
  // Utilizamos un bloque try/catch independiente para el envío inicial
  try {
    // Correo de Inicio
    await transporter.sendMail({
      from: "j.pablo.sorto@gmail.com",
      to: "j.pablo.sorto@gmail.com",
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

  // Lógica de Notificación de Fin (Se dispara al terminar la respuesta)
  res.on("finish", async () => {
    try {
      const {
        numeroDeMensajes = 0,
        numeroDeCorreosEnviados = 0,
        numeroDeWhatsAppEnviados = 0,
      } = res.locals.actividad || {};

      await transporter.sendMail({
        from: "j.pablo.sorto@gmail.com",
        to: "j.pablo.sorto@gmail.com",
        subject: "[Sistema] Reporte de Finalización de envio de Mensajes",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #28a745;"> Proceso Finalizado</h2>
              <p>Estimado(a) usuario,</p>
              <p>El proceso de envío de mensajes iniciado por el usuario con ID ${
                user.id
              } ha concluido. A continuación, el resumen de la actividad:</p>
              
              <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Métricas de Envío</h3>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr>
                      <td style="padding: 8px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Objetivo Total de Mensajes:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${numeroDeMensajes}</td>
                  </tr>
                  <tr style="background-color: #e9ecef;">
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Correos Electrónicos Enviados:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${numeroDeCorreosEnviados}</td>
                  </tr>
                  <tr>
                      <td style="padding: 8px; border: 1px solid #ddd;"><strong>Mensajes de WhatsApp Enviados:</strong></td>
                      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${numeroDeWhatsAppEnviados}</td>
                  </tr>
              </table>
              
              <p>El proceso comenzó el ${new Date().toLocaleString(undefined, {
                timeStyle: "medium",
                dateStyle: "short",
              })}.</p>

              <p>El proceso finalizó el ${new Date().toLocaleString(undefined, {
                timeStyle: "medium",
                dateStyle: "short",
              })}.</p>
              
              <p style="margin-top: 30px; font-size: 0.8em; color: #777;">Este es un mensaje de notificación automática. Por favor, no responda a este correo.</p>
          </div>
        `,
      });
    } catch (emailFinishError) {
      // Registrar el error de envío del correo de finalización
      console.error(
        "Error al enviar correo de FINALIZACIÓN:",
        emailFinishError
      );
    }
  });
};
