import { Request, Response, NextFunction } from "express";

// Middleware de autorización flexible
export const authorizeRolesMiddleware = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "No autenticado" });
      }
      
      // Convertir la cadena de roles del usuario a un array de strings
      const rolUsuario: string[] = req.user.Rol.split(";").filter((r: string) => r.trim() !== "");

      // Acceso total para Administrador
      if (rolUsuario.includes("Administrador")) {
        return next();
      }

      if (req.body?.typeQuery) {
        const typeQuery = req.body.typeQuery;

        if (!rolUsuario.includes(typeQuery)) {
          return res.status(403).json({
            error: `Acceso denegado: tu rol no corresponde al typeQuery (${typeQuery})`,
          });
        }

        return next();
      }

      // Caso normal: validación estática de roles permitidos
      // de los roles del usuario está en la lista de roles permitidos.
      const isAuthorized = rolUsuario.some(rol => rolesPermitidos.includes(rol));

      if (!isAuthorized) {
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