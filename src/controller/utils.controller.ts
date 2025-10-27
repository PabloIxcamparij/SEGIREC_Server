import { Request, Response } from "express";
import Usuarios from "../models/User.model";
import CatalogoService from "../models/CatalogoService.model";
import ControlActividades from "../models/ControlActividades.model";
import ConsultasTabla from "../models/ControlActividadesConsultas.model";
import CatalogoBaseImponible from "../models/CatalogoBaseImponible.model";
import EnvioMensajes from "../models/ControlActividadesEnvioMensajes.model";

// ===================================================================
// Descripcion: Metodos de utilidad variadas para el sistema
// ===================================================================

/**
 * Devuelve todos los codigo y nombres que existen
 */
export const queryServiceCatalogo = async (req: Request, res: Response) => {
  try {
    const services = await CatalogoService.findAll({
      attributes: [
        ["COD_SERVIC", "value"],
        ["DES_SERVIC", "label"],
      ],
      raw: true,
    });

    return res.status(200).json(services);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

/**
 * Devuelve todos los codigo de base imponible que existen
 */
export const queryBaseImponibleCatalogo = async (
  req: Request,
  res: Response
) => {
  try {
    const services = await CatalogoBaseImponible.findAll({
      attributes: [
        ["Codigo", "value"],
        ["Descripción", "label"],
      ],
      raw: true,
    });

    return res.status(200).json(services);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

/* ============================================================
JOIN 2: ControlActividades + Consultas
============================================================ */

export const queryActivitiesQuery = async (req: Request, res: Response) => {
  const limit = 20;
  const page = Number(req.query.page) || 1;
  const offset = (page - 1) * limit;
  try {
    const resultados = await ControlActividades.findAll({
      where: { Tipo: "Consulta" },
      include: [
        {
          model: ConsultasTabla,
          as: "Filtros",
          attributes: ["id", "FiltrosAplicados"],
        },
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["id", "Nombre", "Correo"],
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
      raw: true,
      nest: true,
    });
    return res.status(200).json(resultados);
  } catch (error) {
    console.error("Error al consultar actividades con consultas:", error);
  }
};

/* ============================================================
JOIN 2: ControlActividades + EnvioMensajes
============================================================ */
export const queryActivitiesMessage = async (req: Request, res: Response) => {
  const limit = 20;
  const page = Number(req.query.page) || 1;
  const offset = (page - 1) * limit;
  try {
    const resultados = await ControlActividades.findAll({
      where: { Tipo: "EnvioMensajes" },
      include: [
        {
          model: EnvioMensajes,
          as: "Envios",
          attributes: [
            "id",
            "NumeroDeMensajes",
            "NumeroDeCorreosEnviadosCorrectamente",
            "NumeroDeWhatsAppEnviadosCorrectamente",
          ],
        },
        {
          model: Usuarios,
          as: "Usuario",
          attributes: ["id", "Nombre", "Correo"],
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]],
      raw: true,
      nest: true,
    });
    return res.status(200).json(resultados);
  } catch (error) {
    console.error("Error al consultar actividades con envíos:", error);
  }
};
