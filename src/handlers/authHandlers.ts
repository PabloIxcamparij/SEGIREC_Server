import { Request, Response } from "express";
import User from "../models/User.model";
import { generateToken } from "../utils/jwt";
import jwt from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Rol, Correo, Clave } = req.body;
    const Activo = true;

    // Crear usuario (la contraseña se encripta automáticamente por el hook)
    const user = await User.create({ Nombre, Rol, Correo, Clave, Activo});

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

// Inicia la sesión del usuario
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { Nombre, Clave } = req.body;
    const user = await User.findOne({ where: { Nombre } });
    
    // ... (Verificaciones de usuario, activo y contraseña) ...
    if (!user || !user?.Activo || !await user.validatePassword(Clave)) {
       return res.status(401).json({ error: "Nombre o contraseña inválidos/Usuario inactivo" });
    }
    // --- Lógica de Sesión Única ---
    const newSessionId = require('crypto').randomBytes(10).toString('hex');

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

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["Clave"] }, // Excluir la contraseña
    });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
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
    const {Nombre, Correo, Rol, Activo } = req.body;
    
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.id === req.user.id && !Activo) {
      return res.status(403).json({ error: "No se puede desactivar el usuario actual" });
    }

    if (user.id === req.user.id && Rol !== user.Rol) {
      return res.status(403).json({ error: "No se puede cambiar el rol del usuario actual" });
    }

    user.Nombre = Nombre;
    user.Correo = Correo;
    user.Rol = Rol;
    user.Activo = Activo;

    await user.save();

    res.status(200).json({ message: "Usuario actualizado exitosamente", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

// Eliminar un usuario por su ID
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (user.id === req.user.id) {
      return res.status(403).json({ error: "No se puede eliminar el usuario actual" });
    }

    await user.destroy();
    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

// Cierra la sesión del usuario
export const logoutUser = (req: Request, res: Response) => {
  try {
    const token = req.cookies.AuthToken;

    // Si no hay token, simplemente informamos que la sesión ya está cerrada.
    if (!token) {
      return res.status(200).json({ message: "No autenticado, sesión ya cerrada." });
    }

    // Por si quieres hacer algo con el token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
    } catch (e) {
        // Ignoramos el error de verificación si solo queremos cerrar sesión. 
        // El objetivo principal es BORRAR la cookie.
    }

  } finally { 
    // haya habido éxito en `try` o error capturado.

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