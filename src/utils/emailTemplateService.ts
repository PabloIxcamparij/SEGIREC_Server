import * as Handlebars from "handlebars";
import PlantillaCorreo from "../models/PlantillaCorreo.model";

// Nueva interfaz para el objeto de la plantilla que se almacenará y devolverá
interface CompiledTemplateData {
  asunto: string;
  template: Handlebars.TemplateDelegate;
}

// Cache para almacenar las plantillas compiladas y evitar consultas repetidas a la DB
const templateCache = new Map<string, CompiledTemplateData>();

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
   * Obtiene o compila una plantilla específica.
   */
  public static async getCompiledTemplate(
    clave: string
  ): Promise<CompiledTemplateData> {
    // Si ya está en el cache, se devuelve directamente
    if (templateCache.has(clave)) return templateCache.get(clave)!;

    // Si no existe la plantilla se hace la busqueda en la base de datos
    const plantillaDB = await PlantillaCorreo.findByPk(clave);

    // En el caso de que no exista la plantilla, se informa el error
    if (!plantillaDB)
      throw new Error(`Plantilla con clave ${clave} no encontrada.`);

    // Si existe, se compila y almacena en el cache
    const html = this.buildHTML(
      plantillaDB.cuerpo_html,
      plantillaDB.notas_o_pie
    );

    const compiledTemplate: CompiledTemplateData = {
      asunto: plantillaDB.asunto,
      template: Handlebars.compile(html),
    };

    templateCache.set(clave, compiledTemplate);

    return compiledTemplate;
  }

  // ==========================================================
  // Carga TODAS las plantillas de la base de datos al cache.
  // ==========================================================

  public static async preloadAllTemplates() {
    const plantillas = await PlantillaCorreo.findAll();
    templateCache.clear();

    // Para cada plantilla, se compila y almacena en el cache
    for (const plantilla of plantillas) {
      const html = this.buildHTML(plantilla.cuerpo_html, plantilla.notas_o_pie);
      const compiled = Handlebars.compile(html);
      templateCache.set(plantilla.clave, {
        asunto: plantilla.asunto,
        template: compiled,
      });
    }

    console.log(`${plantillas.length} plantillas cargadas en cache`);
  }

  private static buildHTML(cuerpo: string, pie: string): string {
    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 650px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
            ${cuerpo}
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 12px;">
              ${pie}
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
