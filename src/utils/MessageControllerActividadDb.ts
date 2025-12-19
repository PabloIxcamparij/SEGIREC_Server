import ControlActividades from "../models/ControlActividades.model";
import EnvioMensajes from "../models/ControlActividadesEnvioMensajes.model";

export const guardarRegistroEnvio = async (userId: number, tipo: string, resultados: any) => {
  try {
    const actividad = await ControlActividades.create({
      IdUsuario: userId,
      Tipo: "EnvioMensajes",
      Detalle: `Envío masivo de ${tipo} finalizado`,
      Estado: "Éxito",
    });

    await EnvioMensajes.create({
      IdActividad: actividad.id,
      NumeroDeMensajes: resultados.intentosTotales,
      NumeroDeCorreosEnviadosCorrectamente: resultados.exitosCorreo,
      NumeroDeWhatsAppEnviadosCorrectamente: resultados.exitosWhatsApp,
      DetalleIndividual: resultados.resultadosIndividuales
    });
  } catch (error) {
    console.error("Error al guardar registro en DB:", error);
  }
};