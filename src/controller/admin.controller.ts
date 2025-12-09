import { Request, Response } from "express";
import User from "../models/User.model";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

// ===================================================================
// Descripcion: Acciones que puede hacer el administrador
// ===================================================================

// Creacion de un nuevo usuario
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Rol, Correo, Clave } = req.body;

    // Estos dos atributos al momento de crearse el usuario deben tener estos valores
    const Activo = true,
      Eliminado = false;

    // Crear usuario (la contraseña se encripta automáticamente por el hook)
    const user = await User.create({
      Nombre,
      Rol,
      Correo,
      Clave,
      Activo,
      Eliminado,
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: {
        nombre: user.Nombre,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: "Error al registrar usuario" });
  }
};

// Obtener todos los usuarios registrados
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Se excluye a los usuarios eliminados, es decir que se han marcado como eliminados en el sistema.
    const whereClause: any = {};
    whereClause.Eliminado = false;

    const users = await User.findAll({
      attributes: { exclude: ["Clave"] }, // Excluir la contraseña
      where: whereClause,
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al obtener usuarios, ${error}` });
  }
};

// Obtener un usuario por su ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["Clave"] }, // Excluir la contraseña
    });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Actualizar un usuario por su ID
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { Nombre, Correo, Rol, Activo } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.id === req.user.id && !Activo) {
      return res
        .status(403)
        .json({ error: "No se puede desactivar el usuario actual" });
    }

    if (user.id === req.user.id && !Activo) {
      return res
        .status(403)
        .json({ error: "No se puede desactivar el usuario actual" });
    }

    if (user.id === req.user.id && Rol !== user.Rol) {
      return res
        .status(403)
        .json({ error: "No se puede cambiar el rol del usuario actual" });
    }

    user.Nombre = Nombre;
    user.Correo = Correo;
    user.Rol = Rol;
    user.Activo = Activo;

    await user.save();

    res.status(200).json({ message: "Usuario actualizado exitosamente", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al actualizar usuario, ${error}` });
  }
};

// Eliminar un usuario por su ID (Eliminacion de forma logica)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Uno mismo no debe de ser capaz de eliminarse
    if (user.id === req.user.id) {
      return res
        .status(403)
        .json({ error: `No se puede eliminar el usuario actual` });
    }

    user.Eliminado = true;
    await user.save();

    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al eliminar usuario, ${error}` });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  // Opcional: Relajar CSP solo para esta respuesta
  const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
  const METABASE_SECRET_KEY = process.env.METABASE_EMBED_SECRET_KEY;

  const payload = {
    resource: { dashboard: parseInt(process.env.METABASE_NUMBER_ID_DASHBOARD) },
    params: {},
    exp: Math.round(Date.now() / 1000) + 10 * 60,
  };

  try {
    const token = jwt.sign(payload, METABASE_SECRET_KEY!);
    // En admin.route.ts
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=false&theme=default`;
    res.status(200).json({ url: iframeUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener iframe" });
  }
};
