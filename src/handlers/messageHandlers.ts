import { Request, Response } from "express";
import nodemailer from "nodemailer";
import pLimit from "p-limit";

// =================================================================
// 1. TIPADO Y ESTRUCTURAS DE DATOS
// =================================================================

export type Persona = {
  cedula: string;
  nombre: string;
  correo: string;
  distrito: string;
  numeroDeFinca: string;
  servicio: string | null;
  CodServicio: string;
  valorDeLaDeuda: number;
  fechaVencimiento: string;
  numeroDeCuenta: string;
  periodo: number;
  telefono: string;
  direccion: string;
  areaDeLaPropiedad: number;
  fechaVigencia: string;
  estadoPropiedad: string;
  montoImponible: number;
  codigoBaseImponible: string;
  numeroDeDerecho: string;
};

interface PersonaPropiedadAgrupada {
  cedula: string;
  nombreCompleto: string;
  correo: string;
  fincas: Array<{
    numero: string;
    derecho: string;
    valor: number;
  }>;
}

interface PersonaMorosidadAgrupada {
  cedula: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  direccion: string;
  totalDeuda: number;
  fincas: Array<{
    numero: string;
    numeroDeCuenta: string;
    servicios: Array<{
      codServicio: string;
      nombre: string;
      totalDeuda: number;
      periodoDesde: number;
      periodoHasta: number;
      periodosAtrasados: number;
      cuentas: Array<{
        deuda: number;
        vencimiento: string;
        periodo: number;
      }>;
    }>;
  }>;
}

type GroupedData = {
  tipo: "Propiedad" | "Morosidad";
  data: PersonaPropiedadAgrupada | PersonaMorosidadAgrupada;
};

// =================================================================
// 2. CONFIGURACIÓN
// =================================================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "j.pablo.sorto@gmail.com",
    pass: "zqzy qybh fpvk lsgi",
  },
});

// =================================================================
// 3. GENERACIÓN DE PLANTILLAS
// =================================================================

const generateMorosidadTemplate = (
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

// =================================================================
// 4. AGRUPACIÓN DE DATOS
// =================================================================

const groupDataForEmail = (listaPlana: Persona[]): GroupedData[] => {
  // ... (Filtros de morosidad y propiedadRecords se mantienen igual) ...
  const morosidadRecords = listaPlana.filter(
    (p) => p.servicio !== null && p.servicio !== undefined && p.servicio !== ""
  );
  const propiedadRecords = listaPlana.filter(
    (p) => p.servicio === null || p.servicio === undefined || p.servicio === ""
  );

  const groupedResults: GroupedData[] = [];

  // --- MOROSIDAD ---
  const morosidadMap = new Map<string, PersonaMorosidadAgrupada>();

  morosidadRecords.forEach((p) => {
    if (!morosidadMap.has(p.cedula)) {
      // ... (Inicialización de persona se mantiene igual) ...
      morosidadMap.set(p.cedula, {
        cedula: p.cedula,
        nombreCompleto: p.nombre,
        correo: p.correo,
        telefono: p.telefono,
        direccion: p.direccion,
        totalDeuda: 0,
        fincas: [],
      });
    }

    const persona = morosidadMap.get(p.cedula)!;
    const deudaValor = Number(p.valorDeLaDeuda) || 0; // Asegurar que sea número

    // Finca
    let fincaRecord = persona.fincas.find((f) => f.numero === p.numeroDeFinca);
    if (!fincaRecord) {
      fincaRecord = {
        numero: p.numeroDeFinca,
        numeroDeCuenta: p.numeroDeCuenta,
        servicios: [],
      };
      persona.fincas.push(fincaRecord);
    }

    // Servicio (Agrupado por CodServicio)
    let servicioRecord = fincaRecord.servicios.find(
      (s) => s.codServicio === p.CodServicio
    );
    if (!servicioRecord) {
      servicioRecord = {
        codServicio: p.CodServicio,
        nombre: p.servicio ?? "Servicio sin nombre",
        totalDeuda: 0,
        periodoDesde: p.periodo,
        periodoHasta: p.periodo,
        periodosAtrasados: 0,
        cuentas: [],
      };
      fincaRecord.servicios.push(servicioRecord);
    }

    // Cuentas (Para obtener el conteo de periodos y el rango)
    servicioRecord.cuentas.push({
      deuda: deudaValor,
      vencimiento: p.fechaVencimiento,
      periodo: p.periodo,
    });

    // Acumulados y Resumen
    servicioRecord.totalDeuda += deudaValor;
    servicioRecord.periodoDesde = Math.min(
      servicioRecord.periodoDesde,
      p.periodo
    );
    servicioRecord.periodoHasta = Math.max(
      servicioRecord.periodoHasta,
      p.periodo
    );
    servicioRecord.periodosAtrasados = servicioRecord.cuentas.length; // El número de registros es el número de períodos

    persona.totalDeuda += deudaValor;
  });

  morosidadMap.forEach((data) =>
    groupedResults.push({ tipo: "Morosidad", data })
  );

  //Agrupación por propiedades
  const propiedadMap = new Map<string, PersonaPropiedadAgrupada>();

  propiedadRecords.forEach((p) => {
    if (!propiedadMap.has(p.cedula)) {
      propiedadMap.set(p.cedula, {
        cedula: p.cedula,
        nombreCompleto: p.nombre,
        correo: p.correo,
        fincas: [],
      });
    }

    const persona = propiedadMap.get(p.cedula)!;
    persona.fincas.push({
      numero: p.numeroDeFinca,
      derecho: p.numeroDeDerecho,
      valor: p.montoImponible,
    });
  });

  propiedadMap.forEach((data) =>
    groupedResults.push({ tipo: "Propiedad", data })
  );

  return groupedResults;
};

// =================================================================
// 5. ENDPOINT PRINCIPAL
// =================================================================

export const sendEmails = async (req: Request, res: Response) => {
  try {
    const { personas: listaPlana } = req.body as { personas: Persona[] };

    if (!Array.isArray(listaPlana) || listaPlana.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe enviar una lista de personas válida." });
    }

    const dataToSend = groupDataForEmail(listaPlana);

    const limit = pLimit(5);
    const mailPromises = dataToSend.map((groupedItem) => {
      const personaData = groupedItem.data;
      let emailHtml: string;
      let subject: string;

      if (groupedItem.tipo === "Morosidad") {
        emailHtml = generateMorosidadTemplate(
          personaData as PersonaMorosidadAgrupada
        );
        subject =
          "Notificación de Estado de Cuenta de Morosidad - Municipalidad de Bagaces";
      } else {
        emailHtml = generatePropiedadTemplate(
          personaData as PersonaPropiedadAgrupada
        );
        subject =
          "Notificación de Fincas Omisas de Declaración - Municipalidad de Bagaces";
      }

      return limit(() =>
        transporter.sendMail({
          from: "j.pablo.sorto@gmail.com",
          to: "j.pablo.sorto@gmail.com", // Cambiar por personaData.correo en producción
          subject: subject,
          html: emailHtml,
        })
      );
    });

    await Promise.all(mailPromises);

    const morosidadCount = dataToSend.filter(
      (d) => d.tipo === "Morosidad"
    ).length;
    const propiedadCount = dataToSend.filter(
      (d) => d.tipo === "Propiedad"
    ).length;

    return res.status(200).json({
      message: `Proceso de envío finalizado. Se enviaron ${morosidadCount} correos de Morosidad y ${propiedadCount} correos de Propiedad.`,
      personas_procesadas: dataToSend.map((p) => ({
        cedula: p.data.cedula,
        tipo: p.tipo,
      })),
    });
  } catch (error) {
    console.error("Error en sendEmails:", error);
    return res.status(500).json({ error: "Error al enviar correos." });
  }
};

// =================================================================
// 6. PLANTILLA DE PROPIEDADES
// =================================================================

const generatePropiedadTemplate = (
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
