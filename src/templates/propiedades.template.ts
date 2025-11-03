// src/templates/generatePropiedad.ts

import type { PersonaPropiedadAgrupada } from "../utils/types";
import { emailTemplateService } from "../utils/emailTemplateService";

export const generatePropiedadTemplate = async (
  persona: PersonaPropiedadAgrupada
): Promise<{ asunto: string; html: string }> => {
  // La clave es diferente, el resto del proceso es el mismo
  const { asunto: dbAsunto, template: templateFn } =
    await emailTemplateService.getCompiledTemplate("PROPIEDADES");

  const htmlContent = templateFn({ persona });

  return {
    asunto: dbAsunto,
    html: htmlContent,
  };
};
