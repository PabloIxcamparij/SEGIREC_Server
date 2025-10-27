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
    if (!user || !user?.Activo || user?.Eliminado || !(await user.validatePassword(Clave))) {
      return res
        .status(401)
        .json({ error: "Nombre o contraseña inválidos" });
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
        .json({ message: "No autenticado, sesión ya cerrada." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      req.user = decoded;
    } catch (e) {
    }

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

// Verifica si el usuario tiene una sesión activa
export const verifyAuth = (req: Request, res: Response) => {
  const token = req.cookies.AuthToken;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return res
      .status(200)
      .json({ message: "Autenticado", true: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export const verifyAdmin = (req: Request, res: Response) => {
  const token = req.cookies.AuthToken;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (decoded.rol !== "Administrador") {
      return res.status(403).json({ error: "No autorizado" });
    }
    return res
      .status(200)
      .json({ message: "Autenticado", true: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
