import { Request, Response } from "express";

import jwt from "jsonwebtoken";
import User from "../models/User.model";
import { generateToken } from "../utils/jwt";

// ===================================================================
// Descripcion: Acciones de autenticación de usuarios
// ===================================================================

// Inicia la sesión del usuario
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Clave } = req.body;
    const user = await User.findOne({ where: { Nombre } });

    // Verificaciones de usuario, activo y contraseña
    if (
      !user ||
      !user?.Activo ||
      user?.Eliminado ||
      !(await user.validatePassword(Clave))
    ) {
      return res.status(401).json({
        isAllowed: false,
        error: `Nombre o contraseña inválidos.`,
      });
    }
    // --- Lógica de Sesión Única ---
    const newSessionId = require("crypto").randomBytes(10).toString("hex");

    // Invalida cualquier sesión anterior (almacenando el nuevo ID)
    await user.update({ IdSesion: newSessionId });

    user.IdSesion = newSessionId;

    const token = generateToken(user);

    res.cookie("AuthToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hora
      path: "/",
    });

    res.status(200).json({
      message: "Login exitoso",
      user: { id: user.id },
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Cierra la sesión del usuario
export const logoutUser = (req: Request, res: Response) => {
  try {
    const token = req.cookies.AuthToken;

    // Si no hay token, simplemente informamos que la sesión ya está cerrada.
    if (!token) {
      return res
        .status(200)
        .json({ error: "No autenticado, sesión ya cerrada." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = decoded;
    } catch (e) {}
  } finally {
    //Se elimina la cookie
    res.clearCookie("AuthToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    // Devolvemos el éxito del cierre.
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  }
};


export const verifyAuth = (req: Request, res: Response) => {
  const token = req.cookies.AuthToken;

  if (!token) {
    // Enviar un código de error específico para que el front sepa que es 401
    return res.status(401).json({
      isAuth: false,
      error: "No autenticado. Por favor, inicie sesión.",
    });
  }

  res.status(200).json(true)
}


export const verifyRol = (req: Request, res: Response) => {
  const token = req.cookies.AuthToken;
  const requiredRol = req.query.rol as string;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Caso Especial: "General" (Solo requiere que el token sea válido)
    if (requiredRol === "General") {
      return res.status(200).json(true); // El token ya fue verificado por jwt.verify.
    }

    // Lógica para Roles Específicos
    const rolesString = decoded.rol || "";
    // Convertir la cadena de roles del usuario a un array: ["Administrador", "Morosidad"]
    const userRoles = rolesString
      .split(";")
      .filter((r: string) => r.trim() !== "");

    // El Administrador tiene acceso a TODO
    if (userRoles.includes("Administrador")) {
      return res.status(200).json(true);
    }

    // Comprobación de rol específico:
    // Verificamos si el usuario tiene AL MENOS UNO de los roles que le da acceso al rol requerido.
    // Dado que requiredRol es un string único ("Propiedades"), solo verificamos si el usuario lo tiene.

    const isAllowed = userRoles.includes(requiredRol);

    if (isAllowed) {
      return res.status(200).json(true);
    } else {
      return res.status(403).json({
        isAllowed: false,
        error: `Acceso denegado: Se requiere el rol '${requiredRol}' para esta sección.`,
      });
    }
  } catch (error) {
    return res.status(401).json({
      isAllowed: false,
      error: "Sesión expirada. Por favor, inicia sesión nuevamente.",
    });
  }
};