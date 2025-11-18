// Nuevo util para la llamada a la API de WhatsApp
import axios from 'axios'; // Necesitas instalar axios (o node-fetch)
import * as dotenv from 'dotenv';
dotenv.config();

// --- VARIABLES DE ENTORNO SUGERIDAS (Deben estar en tu .env) ---
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v22.0";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAaZCpiMPZAK4BPxyp3eYSOo3gjW0tEuttGr4iRwmBz2SKeKFtd52D1HE8deIHr0k0DrhWddWijQIW1wJevubRxsuTE9QuiZBnXieLgueyvkKfjMtQIXd12S44aRZAZBZC9wHQ13Q4xTkZBYr8N7Rex1iarqKCH7SXfonYZBn8xhLl7nppNLRGU4ZAAsAN0vl9QZDZD";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "734416859760076";

const WHATSAPP_DESTINATION_NUMBER = "50687775340"; // Número fijo temporalmente

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
        to: personaData.telefono, // Usando el número fijo temporal
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