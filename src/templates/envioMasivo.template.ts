import type { Persona } from "../utils/types";

export const generateMassiveTemplate = (
  persona: Persona,
  mensaje: string
): string => {


  return `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="text-align: center; border-bottom: 2px solid #000000;">Mensaje por parte de la municipalidad</h2>
        
        <h3 style="padding-bottom: 10px;">
          Dirigido para: ${persona.nombre}, Cédula ${persona.cedula}
        </h3>

        <p>Estimado(a) contribuyente,</p>
        <p>
        Por este medio la Municipalidad de Bagaces le invita a
        </p>

        <p>
        ${mensaje}
       </p>
      </div>
    </body>
    </html>
  `;
};
