import { Request, Response } from "express";
import User from "../models/User.model";
import { generateToken } from "../utils/jwt";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Rol, Correo, Clave } = req.body;

    // Crear usuario (la contraseña se encripta automáticamente por el hook)
    const user = await User.create({ Nombre, Rol, Correo, Clave });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        nombre: user.Nombre,
      }
    });

  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: "Error al registrar usuario" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Clave } = req.body;

    const user = await User.findOne({ where: {Nombre }  });

    if (!user) {
      return res.status(401).json({ error: "Correo o contraseña inválidos" });
    }

    const isPasswordValid = await user.validatePassword(Clave);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Correo o contraseña inválidos" });
    }


    res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
      },
      token: generateToken(user),
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};
