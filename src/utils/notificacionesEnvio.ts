import { transporter } from "../config/nodemailer.config";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

/**
 * Utilidad de envío de correo con resumen final de envíos.
 * @param {string} emailUsuario - Correo del usuario que inició el proceso.
 * @param {object} data - Datos del resumen de envíos.
 */
export const enviarCorreoResumenFinal = async (emailUsuario: string, data: any) => {
    const { intentosTotales, exitosCorreo, exitosWhatsApp, resultadosIndividuales, tipo } = data;

    const csvAdjunto =
        resultadosIndividuales.length > 0
            ? generarCSV(resultadosIndividuales)
            : null;

    await transporter.sendMail({
        from: process.env.CORREO_USER,
        to: emailUsuario,
        subject: `[Sistema] Reporte Final - Envío de ${tipo}`,
        html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #2c3e50;">Proceso de Envío Finalizado</h2>
        <p>Resumen de la actividad de <strong>${tipo}</strong>:</p>
        <ul>
          <li><strong>Total destinatarios:</strong> ${intentosTotales}</li>
          <li><strong>Correos exitosos:</strong> ${exitosCorreo}</li>
          <li><strong>WhatsApp exitosos:</strong> ${exitosWhatsApp}</li>
        </ul>
      </div>`,
        attachments: csvAdjunto
            ? [
                {
                    filename: `reporte_envio_${Date.now()}.csv`,
                    content: csvAdjunto,
                    contentType: "text/csv",
                },
            ]
            : [],
    });
};

/**
 * Generador de archivos CSV a partir de los resultados individuales.
 * @param resultados 
 * @returns 
 */
const generarCSV = (resultados: any[]) => {
    const encabezados = [
        "Nombre",
        "Cedula",
        "Correo",
        "Telefono",
        "Correo_OK",
        "WhatsApp_OK",
    ];

    const filas = resultados.map((r) => [
        r.nombre ?? "",
        r.cedula ?? "",
        r.correo ?? "",
        r.telefono ?? "",
        r.correo_ok ? "Enviado" : "Fallo",
        r.whatsapp_ok == null
            ? "-"
            : r.whatsapp_ok
                ? "Enviado"
                : "Fallo",
    ]);

    return [
        encabezados.join(","),
        ...filas.map((f) =>
            f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        ),
    ].join("\n");
};
