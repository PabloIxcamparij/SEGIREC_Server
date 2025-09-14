import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User from "../models/User.model";

declare global {
    namespace Express {
        interface Request {
            user?: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.AuthToken;

    if (!token) {
        console.log(token)
      return res.status(401).json({ error: "No Autorizado: Token no encontrado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    if (typeof decoded === "object" && "id" in decoded) {
      const user = await User.findByPk((decoded as any).id);

      if (!user) {
        return res.status(403).json({ error: "Token no válido: Usuario no encontrado" });
      }

      req.user = user;
      return next();
    } else {
      return res.status(403).json({ error: "Token no válido: Formato incorrecto" });
    }
  } catch (error) {
    console.error("Error al autenticar:", error);
    return res.status(403).json({ error: "Token no válido o expirado" });
  }
};