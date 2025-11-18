import jwt from "jsonwebtoken";
import type { User } from "./types";

/**
 * Genera un token JWT estándar para autenticación.
 * @param user El usuario para el cual se genera el token.
 * @returns token JWT con la información del usuario.
 */

export const generateToken = (user: User) => {
  const payload = {
    id: user.id,
    email: user.Correo,
    rol: user.Rol,
    IdSesion: user.IdSesion,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

/**
 * Genera un token JWT para envío prioritario o WhatsApp.
 * @param userId id del usuario que solicita el envío.
 * @param adminEmail correo electrónico del administrador que autoriza el envío.
 * @param options opciones que indican si el envío es prioritario o por WhatsApp.
 * @returns token JWT con la información de autorización.
 */

// Ahora acepta los flags que necesitas y los incluye en el payload
export const generatePriorityToken = (
  userId: number | string,
  adminEmail: string,
  options: { priority: boolean; whatsApp: boolean }
) => {
  const payload = {
    id: userId,
    email: adminEmail,
    priorityAccess: !!options.priority,
    sendWhatsApp: !!options.whatsApp,
  };
  // Token de corta duración (60s)
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "60s" });
};
