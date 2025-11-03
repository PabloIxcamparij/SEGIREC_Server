// src/templates/generatePropiedad.ts

import type { PersonaMorosidadAgrupada } from "../utils/types";
import { emailTemplateService } from "../utils/emailTemplateService";

export const generateMorosidadTemplate = async (
  persona: PersonaMorosidadAgrupada
): Promise<{ asunto: string; html: string }> => {

  const { asunto: dbAsunto, template: templateFn } =
    await emailTemplateService.getCompiledTemplate("MOROSIDAD");

  const htmlContent = templateFn({ persona });

  return {
    asunto: dbAsunto,
    html: htmlContent,
  };
};
