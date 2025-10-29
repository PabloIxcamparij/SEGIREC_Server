import * as Handlebars from "handlebars";
import PlantillaCorreo from "../models/PlantillaCorreo.model";

// Cache para almacenar las plantillas compiladas y evitar consultas repetidas a la DB
const templateCache = new Map<string, Handlebars.TemplateDelegate>();

// ==========================================================
// REGISTRO GLOBAL DE HELPERS (Se ejecuta al cargar el módulo)
// ==========================================================
Handlebars.registerHelper("formatCurrency", (amount) => {
  // Si el valor no es un número válido (puede ser null, undefined, o string inesperado), devuelve N/A
  if (typeof amount !== "number" || isNaN(amount)) {
    return "N/A";
  }
  // Formatea el número a moneda de Costa Rica (o tu región preferida)
  try {
    // Añadimos el símbolo de colón (¢) y usamos la configuración regional
    return `${amount.toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch (e) {
    console.error("Error al formatear moneda:", e);
    return `${amount.toFixed(2)}`; // Fallback simple
  }
});
// ==========================================================

export class emailTemplateService {
  /**
   * Obtiene la plantilla desde la DB, la compila y la cachea.
   * @param clave La clave de la plantilla (ej: 'MOROSIDAD')
   * @returns La función compilada de Handlebars.
   */
  public static async getCompiledTemplate(
    clave: string
  ): Promise<Handlebars.TemplateDelegate> {
    if (templateCache.has(clave)) {
      return templateCache.get(clave)!;
    }

    const plantillaDB = await PlantillaCorreo.findByPk(clave);

    if (!plantillaDB) {
      throw new Error(`Plantilla con clave ${clave} no encontrada en DB.`);
    } // 1. Unir el cuerpo y el pie de página

    const plantillaCompleta = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 650px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                ${plantillaDB.cuerpo_html}
                <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 12px;">
                   ${plantillaDB.notas_o_pie}
                </div>
            </div>
        </body>
        </html>
    `;

    const template = Handlebars.compile(plantillaCompleta);
    templateCache.set(clave, template);
    return template;
  }
}
