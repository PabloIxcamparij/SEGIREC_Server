import type { PersonaPropiedadAgrupada } from "../utils/types";

export const generatePropiedadTemplate = (
  persona: PersonaPropiedadAgrupada
): string => {
  const tableRows = persona.fincas
    .map(
      (finca) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${finca.numero}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${finca.derecho}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">¢${finca.valor.toLocaleString(
          "es-CR"
        )}</td>
      </tr>
    `
    )
    .join("");

  const fincaTable = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
      <thead>
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Fincas</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Derecho</th>
          <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Valor de la Finca</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  return `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="text-align: center; border-bottom: 2px solid #000000;">Estado de Cuenta de Morosidad de Propiedades</h2>
        
        <h3 style="padding-bottom: 10px;">
          Contribuyente: ${persona.nombreCompleto}, Cédula ${persona.cedula}
        </h3>

        <p>Estimado(a) contribuyente,</p>
        <p>
        Por este medio la Municipalidad de Bagaces le invita a actualizar las declaraciones de la finca que se encuentran a su nombre en nuestro sistema. Lo anterior debido a que la finca se encuentra omisa de declaración; le recordamos que la actualización se debe realizar al menos cada 5 años según la Ley 7509, Ley de Impuesto sobre Bienes Inmuebles. Actualmente nos encontramos en un proceso de regularización de contribuyentes omisos de declaración, por este motivo se le invita a realizar la declaración de forma voluntaria, concediendo un plazo de 10 días hábiles para presentar este trámite; caso contrario la Municipalidad procederá con la valoración de sus terrenos.
        </p>

        ${fincaTable}

        <p>
        <strong>Requisitos para sociedades:</strong>
        - Representante Legal
        - Personería Jurídica (Cuando sea sociedad)
         <strong>Trámite en línea:</strong>
        Existe la opción de realizar el trámite en línea si cuenta con firma digital o en su efecto, se envía la declaración y se procede con la firma en físico para luego enviar el documento por medio de Correos de Costa Rica a la Oficina de Bienes Inmuebles de la Municipalidad de Bagaces.
        <strong>Observaciones:</strong>
        Si se realiza el trámite presencial, para una mejor atención recomendamos acordar un día
        en específico.
        Cualquier consulta a los teléfonos <strong>26901304 / 26901306 / 26901331</strong>.</p>
      </div>
    </body>
    </html>
  `;
};
