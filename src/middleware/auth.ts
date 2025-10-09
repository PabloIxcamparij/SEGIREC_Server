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
      console.log(token);
      return res.status(401).json({ error: "No Autorizado: Token no encontrado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, IdSesion: string }; // TIPADO MEJORADO

    if (typeof decoded === "object" && "id" in decoded) {
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(403).json({ error: "Token no válido: Usuario no encontrado" });
      }
      
      // CLAVE DE SESIÓN ÚNICA: Comparar el ID de la sesión.
      // 1. Asegúrate que 'IdSesion' existe en tu modelo User
      // 2. Asegúrate que 'IdSesion' está en el payload del JWT (decoded)
      if (user.IdSesion !== decoded.IdSesion) {
        // La sesión de este token ha sido invalidada por un login posterior.
        console.log("Sesión inválida por concurrencia");
        
        // Opcional pero recomendado: Limpiar la cookie del navegador (cierre forzado).
        res.clearCookie("AuthToken", { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
        
        return res.status(401).json({ error: "Sesión cerrada: Se ha iniciado sesión en otro dispositivo." });
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