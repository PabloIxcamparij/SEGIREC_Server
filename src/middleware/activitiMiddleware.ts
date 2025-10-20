// middlewares/authorizeRoles.ts
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express";
import ControlActividades from "../models/ControlActividades.model";

// Middleware de autorización flexible
export const activitiMiddleware = (
  tipo: string,
  detalle: string,
  numeroDeCorreos: number
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      console.log(req.body)

      const status = res.statusCode;
      const user = jwt.verify(req.cookies.AuthToken, process.env.JWT_SECRET as string);

      res.on("finish", async () => {
        await ControlActividades.create({
          IdUsuario: user.id,
          Tipo: tipo,
          Detalle: detalle,
          Estado: status >= 400 ? "Error" : "Éxito",
          NumeroDeCorreos: numeroDeCorreos,
        });
      });

      next();
    } catch (error) {
      console.error("Error en interno:", error);
      return res.status(500).json({ error: "Error interno" });
    }
  };
};
