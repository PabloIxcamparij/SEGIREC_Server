// Nuevo util para la llamada a la API de WhatsApp
import axios from 'axios'; // Necesitas instalar axios (o node-fetch)
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

// --- VARIABLES DE ENTORNO SUGERIDAS (Deben estar en tu .env) ---
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

/**
 * Envía un mensaje de plantilla de WhatsApp.
 * @param to El número de teléfono del destinatario (por ahora fijo).
 * @param templateName El nombre de la plantilla de WhatsApp
 */

export const sendWhatsAppMessage = async (telefono: string, templateName: string, personaData: any) => {
    if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
        throw new Error("WHATSAPP_PHONE_ID o WHATSAPP_TOKEN no están configurados.");
    }
    console.log(personaData.telefono);
    
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`;

    // Nota: La plantilla "hello_world" no usa componentes de cuerpo. 
    // Si tu plantilla requiere variables (ej: "text": "Hola, {{1}}"), debes añadir el bloque components.
    const data = {
        messaging_product: "whatsapp",
        to: formTelefono(personaData.telefono),
        type: "template",
        template: {
            name: templateName, // Usamos un nombre fijo o lo pasamos como argumento
            language: { code: "en_US" } // Ajusta el código de idioma
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // La respuesta de éxito de Meta contiene un 'id' del mensaje
        return `WhatsApp enviado. ID: ${response.data.messages[0].id}`;

    } catch (error) {
        // Mejor registro de errores de la API de Meta
        const status = (error as any).response?.status || 'N/A';
        const errorData = (error as any).response?.data || (error as Error).message;
        throw new Error(`Fallo en API WhatsApp (Status ${status}): ${JSON.stringify(errorData)}`);
    }
};

/**
 * Formatea un número de teléfono costarricense.
 * - Elimina espacios, guiones y caracteres no numéricos.
 * - Asegura que el número empiece con 506.
 * - Devuelve formato: 506XXXXXXXX
 */
export const formTelefono = (telefono: string): string => {
    if (!telefono) return "";

    // 1. Quitar todo lo que NO sea número
    let limpio = telefono.replace(/\D/g, "");

    // 2. Si comienza con 506, lo dejamos
    if (limpio.startsWith("506")) {
        return limpio;
    }

    // 3. Si viene en formato +506
    if (limpio.startsWith("506")) {
        return limpio;
    }

    // 4. Si viene con 8 dígitos (número local CR)
    if (limpio.length === 8) {
        return "506" + limpio;
    }

    // 5. Si viene con 7 u otros formatos extraños, igual se le agrega 506
    return "506" + limpio;
};
