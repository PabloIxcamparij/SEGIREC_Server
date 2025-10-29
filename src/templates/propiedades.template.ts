// src/templates/generatePropiedad.ts

import type { PersonaPropiedadAgrupada } from "../utils/types";
import { emailTemplateService } from "../utils/emailTemplateService";

export const generatePropiedadTemplate  = async (
  persona: PersonaPropiedadAgrupada
): Promise<{ asunto: string, html: string }> => {
  
  // La clave es diferente, el resto del proceso es el mismo
  const templateFn = await emailTemplateService.getCompiledTemplate("PROPIEDADES");

  const htmlContent = templateFn({ persona });

  return {
    asunto: "Actualización de Declaración de Propiedades", // (O extraído de la DB)
    html: htmlContent 
  };
};