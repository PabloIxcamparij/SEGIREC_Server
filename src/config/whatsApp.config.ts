// Nuevo util para la llamada a la API de WhatsApp
import axios from 'axios'; // Necesitas instalar axios (o node-fetch)
import * as dotenv from 'dotenv';
dotenv.config();

// --- VARIABLES DE ENTORNO SUGERIDAS (Deben estar en tu .env) ---
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v22.0";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAaZCpiMPZAK4BP9pQ9IAC8juF2VikVM3nfbcWq22xwe9Y64e43dUIqjhXQtBWS8FZAhndTeEVXjzZBVqYMZBdcm8YgUoEuASIi5Q75YuXT6rah5L0CsMrHxiOzaX2ipQj7QZCIycJ8DGptCAXvphypgszI3gUbb3mK029V2dZCbv9Csf7vLaPq4MnwlhQJcWOlJZCR3lZBfFRY7ckHK5mNnKDNYcNcsduHTZBi9pnhqNuo97hgcos1D2VNa8nJoEV8zE4hRoDgLnuVZAyWPUWtdSq9";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "734416859760076";

const WHATSAPP_DESTINATION_NUMBER = "50687775340"; // Número fijo temporalmente

/**
 * Envía un mensaje de plantilla de WhatsApp.
 * @param to El número de teléfono del destinatario (por ahora fijo).
 * @param templateName El nombre de la plantilla de WhatsApp
 */

export const sendWhatsAppMessage = async (to: string, templateName: string, personaData: any) => {
    if (!WHATSAPP_PHONE_ID || !WHATSAPP_TOKEN) {
        throw new Error("WHATSAPP_PHONE_ID o WHATSAPP_TOKEN no están configurados.");
    }
    
    const url = `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`;

    // Nota: La plantilla "hello_world" no usa componentes de cuerpo. 
    // Si tu plantilla requiere variables (ej: "text": "Hola, {{1}}"), debes añadir el bloque components.
    const data = {
        messaging_product: "whatsapp",
        to: WHATSAPP_DESTINATION_NUMBER, // Usando el número fijo temporal
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