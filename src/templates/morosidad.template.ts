// src/templates/generatePropiedad.ts

import type { PersonaMorosidadAgrupada } from "../utils/types";
import { emailTemplateService } from "../utils/emailTemplateService";

export const generateMorosidadTemplate = async (
  persona: PersonaMorosidadAgrupada
): Promise<{ asunto: string; html: string }> => {
  // La clave es diferente, el resto del proceso es el mismo
  const templateFn = await emailTemplateService.getCompiledTemplate(
    "MOROSIDAD"
  );

  const htmlContent = templateFn({ persona });

  return {
    asunto: "Actualización de Declaración de Propiedades", // (O extraído de la DB)
    html: htmlContent,
  };
};
