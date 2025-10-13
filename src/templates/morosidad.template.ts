import type { PersonaMorosidadAgrupada } from "../utils/types";

export const generateMorosidadTemplate = (
  persona: PersonaMorosidadAgrupada
): string => {
  let contentHTML = "";

  persona.fincas.forEach((finca) => {
    let totalFinca = 0;

    // Fila de encabezado por Finca (Cuenta: XXXXX | Número de Finca: YYYYY)
    const headerRow = `
            <tr style="background-color: #66BEF5; font-weight: bold;">
                <td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: left;">
                    Cuenta: ${
                      finca.numeroDeCuenta || "N/A"
                    } | Número de Finca: ${finca.numero}
                </td>
            </tr>
        `;

    // Filas resumen de cada servicio (Impuesto)
    const serviceRows = finca.servicios
      .map((servicio) => {
        totalFinca += servicio.totalDeuda;

        return `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${
                          servicio.nombre
                        }</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                          servicio.periodoDesde
                        }</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                          servicio.periodoHasta
                        }</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                          servicio.periodosAtrasados
                        }</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">¢${servicio.totalDeuda.toLocaleString(
                          "es-CR"
                        )}</td>
                    </tr>
                `;
      })
      .join("");

    contentHTML += `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; border: 1px solid #ccc;">
                <thead>
                    ${headerRow}
                    <tr style="text-align:center;">
                        <th rowspan="2" style="padding: 8px; border: 1px solid #ddd;">Impuesto</th>
                        <th colspan="2" style="padding: 8px; border: 1px solid #ddd;">Periodo</th>
                        <th rowspan="2" style="padding: 8px; border: 1px solid #ddd;">Periodos Atrasados</th>
                        <th rowspan="2" style="padding: 8px; border: 1px solid #ddd;">Total</th>
                    </tr>
                    <tr style="text-align:center;">
                        <th style="padding: 4px; border: 1px solid #ddd; text-align: center; font-weight: normal;">Desde</th>
                        <th style="padding: 4px; border: 1px solid #ddd; text-align: center; font-weight: normal;">Hasta</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceRows}
                </tbody>
            </table>
            
        `;
  });

  const footer = `
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; font-size: 12px;">
            <p><strong>Nota:</strong> No omitimos recordarle que los intereses aumentan por cada día de atraso, por lo que el monto adeuda indicado está referido a la fecha de esta notificación. De acuerdo al Artículo No 78 del Código Municipal. Para mayor información favor comunicarse con el Departamento de Gestión Tributaria, al teléfono 2690-1302 - 2690-1333 o al email <a href="mailto:depositoimpuestos@bagaces.go.cr">depositoimpuestos@bagaces.go.cr</a>, o presentarse en nuestras oficinas de Lunes a Jueves de 8:00 am a 3:45pm y el viernes de 8:00 am a 2:45 pm.</p>
            <p>1. <strong>Pago directo:</strong> Se realiza en las cajas de la Municipalidad.</p>
            <p>2. <strong>Pago directo por convenio:</strong> Se realiza en la cuenta BNCR, puntos de BN Servicios y BN Internet Banking o en las siguientes cuentas: Banco Nacional CR31015104910010019404, cuenta de Banco de Costa Rica: CR78015201323000000277</p>
        </div>
    `;

  return `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <div style="max-width: 650px; margin: auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h2 style="text-align: center; border-bottom: 2px solid #000000;">Estado de Cuenta de Morosidad</h2>
                
                <div style="margin-bottom: 15px; padding: 10px;">
                    <p style="margin: 5px 0;"><strong>Contribuyente:</strong> ${
                      persona.nombreCompleto
                    }</p>
                    <p style="margin: 5px 0;"><strong>Cédula:</strong> ${
                      persona.cedula
                    }</p>
                    <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${
                      persona.telefono
                    }</p>
                    <p style="margin: 5px 0;"><strong>Correo:</strong> ${
                      persona.correo
                    }</p>
                    <p style="margin: 5px 0;"><strong>Dirección:</strong> ${
                      persona.direccion
                    }</p>
                </div>

                ${contentHTML}

                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr style="font-weight: bold; background-color: #f2f2f2;">
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right; width: 80%;">Total</td>
                        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">¢${persona.totalDeuda.toLocaleString(
                          "es-CR"
                        )}</td>
                    </tr>
                </table>

                ${footer}
            </div>
        </body>
        </html>
    `;
};