import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import ControlActividades from "../models/ControlActividades.model";
import EnvioMensajes from "../models/ControlActividadesEnvioMensajes.model";
import ConsultasTabla from "../models/ControlActividadesConsultas.model";

/**
 * Middleware para registrar actividades.
 * @param tipo "Consulta" | "EnvioMensajes" | otros
 * @param detalle Descripción textual
 */

export const activitiMiddleware = (tipo: string, detalle: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = jwt.verify(
        req.cookies.AuthToken,
        process.env.JWT_SECRET as string
      ) as { id: number; [key: string]: any };

      res.on("finish", async () => {
        try {
          const status = res.statusCode;

          // Crear registro padre
          const actividad = await ControlActividades.create({
            IdUsuario: Number(user.id),
            Tipo: tipo,
            Detalle: detalle,
            Estado: status >= 400 ? "Error" : "Éxito",
          });

          // Crear hija según tipo
          if (tipo === "Consulta") {
            // Formato de filtros
            let filtros: string;
            if (!req.body || Object.keys(req.body).length === 0) {
              filtros = "No se hizo uso de filtros en esta consulta.";
            } else {
              const filtrosArray = Object.entries(req.body).map(
                ([key, value]) => `• ${key}: ${JSON.stringify(value)}`
              );
              filtros = `Se hizo uso de los siguientes filtros: ${filtrosArray.join()}`;
            }

            await ConsultasTabla.create({
              IdActividad: actividad.id,
              FiltrosAplicados: filtros,
            });
          } else if (tipo === "EnvioMensajes") {
            const {
              numeroDeMensajes = 0,
              numeroDeCorreosEnviados = 0,
              numeroDeWhatsAppEnviados = 0,
              resultadosIndividuales = [],
            } = res.locals.actividad || {};

            await EnvioMensajes.create({
              IdActividad: actividad.id,
              NumeroDeMensajes: numeroDeMensajes,
              NumeroDeCorreosEnviadosCorrectamente: numeroDeCorreosEnviados,
              NumeroDeWhatsAppEnviadosCorrectamente: numeroDeWhatsAppEnviados,
              DetalleIndividual: resultadosIndividuales
            });
          }
        } catch (err) {
          console.error("Error guardando actividad:", err);
        }
      });

      next();
    } catch (error) {
      console.error("Error interno activitiMiddleware:", error);
      return res.status(500).json({ error: "Error interno" });
    }
  };
};
