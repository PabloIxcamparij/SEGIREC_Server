import { Request, Response } from "express";
import Usuarios from "../models/User.model";
import CatalogoService from "../models/CatalogoService.model";
import ControlActividades from "../models/ControlActividades.model";
import ConsultasTabla from "../models/ControlActividadesConsultas.model";
import CatalogoBaseImponible from "../models/CatalogoBaseImponible.model";
import CatalogoAsuntosCorreos from "../models/CatalogoAsuntosCorreos.model"; 
import EnvioMensajes from "../models/ControlActividadesEnvioMensajes.model";
import { Sequelize } from "sequelize";

// ===================================================================
// Descripción general
// -------------------------------------------------------------------
// Este módulo contiene los métodos variados para consultas de
// catálogos y actividades.
// ===================================================================

/**
 * Busca todos los servicios del catálogo de servicios.
 * @param res 
 * @returns Regresa la lista de servicios como label (Descripción) y value (Concatena el AUX con el Codigo).
 */
export const queryServiceCatalogo = async (req : Request, res: Response) => {
  try {
    const services = await CatalogoService.findAll({
      attributes: [
        ["DES_SERVIC", "label"],
        [
          Sequelize.fn(
            "CONCAT",
            Sequelize.col("COD_SERVIC"),
            ";",
            Sequelize.col("AUX_CONTAB")
          ),
          "value",
        ],
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
 * Busca todos los códigos del catálogo de base imponible.
 * @param res 
 * @returns Regresa la lista de servicios como label (Descripción) y value (Código).
 */
export const queryBaseImponibleCatalogo = async (req : Request, res: Response) => {
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

export const queryAsuntosCorreo = async (req: Request, res: Response) => {
    try {
    const services = await CatalogoAsuntosCorreos.findAll({
      attributes: [
        ["Asunto", "value"],
        ["Asunto", "label"],
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
 * Consulta actividades con consultas guardadas.
 * @param req 
 * @param res 
 * @returns Regresa las actividades con sus consultas asociadas.
 */
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

/**
 * Consulta actividades con envíos de mensajes.
 * @param req 
 * @param res 
 * @returns Regresa las actividades con sus envíos asociados.
 */
export const queryActivitiesMessage = async (req: Request, res: Response) => {
  const limit = 50;
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
            "DetalleIndividual"
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
