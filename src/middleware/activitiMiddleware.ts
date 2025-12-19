import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import ControlActividades from "../models/ControlActividades.model";
import ConsultasTabla from "../models/ControlActividadesConsultas.model";

export const activitiMiddleware = (tipo: string, detalle: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Si es envío de mensajes, ignoramos este middleware para no duplicar registros
    if (tipo === "EnvioMensajes") return next();

    res.on("finish", async () => {
      try {
        if (res.statusCode >= 400) return;
        const user = jwt.verify(req.cookies.AuthToken, process.env.JWT_SECRET as string) as any;

        if (tipo === "Consulta") {
          const actividad = await ControlActividades.create({
            IdUsuario: Number(user.id),
            Tipo: tipo,
            Detalle: detalle,
            Estado: "Éxito",
          });

          const filtros = Object.keys(req.body).length === 0 ? "Sin filtros" : JSON.stringify(req.body);
          await ConsultasTabla.create({ IdActividad: actividad.id, FiltrosAplicados: filtros });
        }
      } catch (err) {
        console.error("Error en activitiMiddleware:", err);
      }
    });
    next();
  };
};