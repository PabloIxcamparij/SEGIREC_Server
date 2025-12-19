// =================================================================
// Configuración de Nodemailer — Microsoft 365 (Office 365)
// =================================================================
import nodemailer from "nodemailer";

/**
 * Transportador SMTP para el envío de correos mediante Microsoft 365.
 *
 * Esta configuración utiliza el servidor SMTP oficial de Office 365 y
 * habilita el uso de STARTTLS (que es el método requerido por Microsoft).
 *
 * Requiere que las credenciales se encuentren definidas en variables
 * de entorno: `CORREO_USER` (correo completo) y `CORREO_PASS` (contraseña
 * de la cuenta o contraseña de aplicación si la organización lo exige).
 *
 * Parámetros clave del transporter:
 * - `host`: Servidor SMTP de Microsoft 365.
 * - `port`: Puerto 587 (STARTTLS). Microsoft NO permite SSL puro en el puerto 465.
 * - `secure`: Debe ser `false`, ya que STARTTLS inicia como conexión insegura
 *             y luego negocia seguridad.
 * - `requireTLS`: Obliga a Nodemailer a exigir que el servidor use TLS.
 * - `auth.user`: Dirección de correo utilizada para autenticación.
 * - `auth.pass`: Contraseña o password de aplicación.
 * - `tls.ciphers`: Requerido en algunas implementaciones para evitar errores
 *                  de compatibilidad en el handshake TLS.
 *
 * Notas importantes:
 * - Si la cuenta está protegida con MFA, es obligatorio usar una
 *   **contraseña de aplicación** generada en Microsoft 365.
 * - En entornos empresariales, el administrador puede requerir la
 *   habilitación del protocolo SMTP Auth para que el envío funcione.
 *
 * @type {import("nodemailer").Transporter}
 */
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

export const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // TLS/STARTTLS
  auth: {
    user: process.env.CORREO_USER,
    pass: process.env.CORREO_PASS,
  },
  tls: {
    // Microsoft es estricto; a veces ciphers: 'SSLv3' causa errores en Node 18+.
    // Por lo que se amplia la configuración a una mas compatible pero segura.
    ciphers: "TLSv1.2, TLSv1.3", 
    rejectUnauthorized: true, 
  },
  // Optimización para envíos masivos
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});