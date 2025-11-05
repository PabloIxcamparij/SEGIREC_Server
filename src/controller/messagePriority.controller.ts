import User from '../models/User.model';
import { transporter } from '../config/nodemailer.config';
import { Op } from "sequelize";
import { generatePriorityToken } from '../utils/jwt';


// Lógica de búsqueda del administrador
const findFirstValidAdmin = async () => {
    // Buscar el primer usuario con Rol 'Administrador', Activo=true, y Eliminado=false.
    const adminUser = await User.findOne({
        where: {
            Rol: { [Op.like]: '%Administrador%' }, // Busca si contiene 'Administrador'
            Activo: true,
            Eliminado: { [Op.not]: true }, // O si tienes un campo 'Eliminado', busca que NO sea true
        },
        // Opcional: ordenar para asegurar la consistencia (ej. por fecha de creación)
        order: [['createdAt', 'ASC']], 
    });

    return adminUser;
};

export const requestCodePrioritaryMessage = async (req, res) => {
    try {
        // 1. BUSCAR AL ADMINISTRADOR VÁLIDO
        const adminUser = await findFirstValidAdmin();

        if (!adminUser) {
            return res.status(500).json({ 
                error: 'No se encontró un administrador activo y válido para enviar el código.' 
            });
        }
        
        const adminEmail = adminUser.Correo;

        // 2. GENERAR Y ALMACENAR EL CÓDIGO DE 6 CIFRAS
        const verificationCode = generateAndStoreCode(adminEmail);
        
        // 3. PREPARAR Y ENVIAR EL CORREO
        const template = {
            asunto: "Código de Verificación para Envío Prioritario",
            html: `
                <h1>Verificación de Seguridad</h1>
                <p>Usted ha solicitado realizar un Envío Prioritario de mensajes.</p>
                <p>Su código de verificación es:</p>
                <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f0f0f0; border-radius: 5px; display: inline-block;">
                    ${verificationCode}
                </div>
                <p>Este código expira en 5 minutos.</p>
            `,
        };

        await transporter.sendMail({
            from: "j.pablo.sorto@gmail.com", // Reemplaza con tu correo configurado
            to: adminEmail, // Usar el correo del administrador encontrado
            subject: template.asunto,
            html: template.html,
        });

        // 4. RESPUESTA EXITOSA
        return res.status(200).json({ 
            message: 'Código de verificación enviado exitosamente al administrador.' 
        });

    } catch (error) {
        console.error('Error al solicitar el código prioritario:', error);
        // Manejo de error de correo (si falla el sendMail)
        if (error.message && error.message.includes('transporter')) {
             return res.status(500).json({ 
                error: 'Fallo al enviar el correo con el código de seguridad. Verifique la configuración del transportador.' 
            });
        }
        return res.status(500).json({ error: 'Ocurrió un error interno del servidor.' });
    }
};

export const confirmCodePrioritaryMessage = async (req, res) => {
    try {
        const { code } = req.body;
        const adminEmail = codeStore.adminEmail;

        if (!adminEmail) {
             return res.status(400).json({ success: false, error: 'No se ha solicitado ningún código de verificación.' });
        }

        // Verificar el código
        const isValid = verifyCode(codeStore.adminEmail, code);
        
        if (!isValid) {
            return res.status(400).json({ error: 'Código de verificación inválido o expirado.' });
        }

        const adminUser = await findFirstValidAdmin();

        // Limpiamos el código después del uso exitoso (seguridad)
        codeStore.adminEmail = null;
        codeStore.code = null;
        codeStore.expiresAt = null;

        // **GENERAMOS EL TOKEN DE PRIORIDAD**
        const priorityToken = generatePriorityToken(adminUser.id, adminEmail);

        // Devolvemos el éxito y el token
        return res.status(200).json({ 
            success: true, 
            message: 'Código verificado correctamente. Token de envío prioritario emitido.',
            token: priorityToken // <--- Enviamos el token al frontend
        });
    } catch (error) {
        console.error('Error al confirmar el código prioritario:', error);
        return res.status(500).json({ error: 'Ocurrió un error interno del servidor.' });
    }
};

// Almacenamiento temporal en memoria para el código. 
// En producción, usa Redis o una base de datos con TTL (Time To Live).
export const codeStore = {
  adminEmail: null,
  code: null,
  expiresAt: null,
  // 5 minutos de validez
  VALIDITY_TIME_MS: 5 * 60 * 1000, 
};

/**
 * Genera un código de 6 dígitos y lo almacena.
 * @param {string} email - Correo del administrador.
 * @returns {string} El código generado.
 */

export const generateAndStoreCode = (email) => {
    // Genera un número aleatorio de 6 dígitos
    const newCode = Math.floor(100000 + Math.random() * 900000).toString(); 
    
    codeStore.adminEmail = email;
    codeStore.code = newCode;
    codeStore.expiresAt = Date.now() + codeStore.VALIDITY_TIME_MS;

    console.log(`[Seguridad] Código generado para ${email}: ${newCode}`);
    return newCode;
};

/**
 * Verifica si el código proporcionado es correcto y no ha expirado.
 * @param {string} email - Correo del administrador al que se le envió el código.
 * @param {string} submittedCode - El código que el usuario ingresó.
 * @returns {boolean} True si es válido, False en caso contrario.
 */

export const verifyCode = (email, submittedCode) => {
    // 1. Verificar que haya un código almacenado para ese email
    if (codeStore.adminEmail !== email || !codeStore.code) {
        return false;
    }

    // 2. Verificar expiración
    if (Date.now() > codeStore.expiresAt) {
        // Si expiró, limpiamos y devolvemos error
        codeStore.adminEmail = null;
        codeStore.code = null;
        codeStore.expiresAt = null;
        return false;
    }

    // 3. Verificar código
    return codeStore.code === submittedCode;
};