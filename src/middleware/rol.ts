// middlewares/authorizeRoles.ts
import { Request, Response, NextFunction } from "express";

// Middleware de autorización flexible
export const authorizeRoles = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }

      const rolUsuario = req.user.Rol;

      // Acceso total para Administrador
      if (rolUsuario === "Administrador") {
        return next();
      }

      // Caso dinámico: si viene typeQuery en el body, se valida contra él
      if (req.body?.typeQuery) {
        const typeQuery = req.body.typeQuery;

        if (rolUsuario !== typeQuery) {
          return res.status(403).json({
            error: `Acceso denegado: tu rol (${rolUsuario}) no corresponde al typeQuery (${typeQuery})`,
          });
        }

        return next();
      }

      // Caso normal: validación estática de roles permitidos
      if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({
          error: `Acceso denegado: se requiere rol ${rolesPermitidos.join(" o ")}`,
        });
      }

      // Autorizado
      next();
    } catch (error) {
      console.error("Error en autorización:", error);
      return res.status(500).json({ error: "Error interno en autorización" });
    }
  };
};
