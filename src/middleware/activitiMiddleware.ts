// middlewares/authorizeRoles.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import ControlActividades from "../models/ControlActividades.model";

// Middleware de autorización flexible
export const activitiMiddleware = (tipo: string, detalle: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      let filtros;

      if (tipo === "Consulta") {
        filtros = `Filtros aplicados: ${JSON.stringify(req.body)}`;
      }

      const user = jwt.verify(
        req.cookies.AuthToken,
        process.env.JWT_SECRET as string
      );

      res.on("finish", async () => {
        try {
          const status = res.statusCode;

          const {
            numeroDeMensajes,
            numeroDeCorreosEnviados,
            numeroDeWhatsAppEnviados,
          } = res.locals.actividad || {};

          await ControlActividades.create({
            IdUsuario: Number(user.id),
            Tipo: tipo,
            Detalle: detalle,
            Estado: status >= 400 ? "Error" : "Éxito",
            FiltrosAplicados: filtros,
            NumeroDeMensajes: numeroDeMensajes,
            NumeroDeCorreosEnviadosCorrectamente: numeroDeCorreosEnviados,
            NumeroDeWhatsAppEnviadosCorrectamente: numeroDeWhatsAppEnviados,
          });
        } catch (err) {
          console.error("Error guardando actividad:", err);
        }
      });

      next();
    } catch (error) {
      console.error("Error en interno:", error);
      return res.status(500).json({ error: "Error interno" });
    }
  };
};
