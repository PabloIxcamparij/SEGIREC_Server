import { Request, Response } from "express";
import User from "../models/User.model";
import { generateToken } from "../utils/jwt";
import jwt from "jsonwebtoken";
import { CookieOptions } from "express";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Rol, Correo, Clave } = req.body;

    const user = await User.create({ Nombre, Rol, Correo, Clave });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: { nombre: user.Nombre },
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: "Error al registrar usuario" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Clave } = req.body;
    const user = await User.findOne({ where: { Nombre } });

    if (!user || !(await user.validatePassword(Clave))) {
      return res.status(401).json({ error: "Nombre o contraseña inválidos" });
    }

    const token = generateToken(user);

    res.cookie("AuthToken", token, getCookieOptions());

    res.status(200).json({
      message: "Login exitoso",
      user: { id: user.id },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  try {
    const token = req.cookies.AuthToken;
    if (!token) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;

    res.clearCookie("AuthToken", getCookieOptions());

    res.status(200).json({ message: "Sesión cerrada correctamente." });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ message: "Ocurrió un error al cerrar la sesión." });
  }
};

export const verifyAuth = (req: Request, res: Response) => {
  const token = req.cookies.AuthToken;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    return res
      .status(200)
      .json({ message: "Autenticado", ok: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

// utils/cookieOptions.ts
export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "lax" : "none") as CookieOptions["sameSite"],
    maxAge: 60 * 60 * 1000,
    path: "/",
  };
};
