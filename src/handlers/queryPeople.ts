import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import Morosidad from "../models/Morosidad.model";
import FechaVigencia from "../models/FechaVigencia.model";

//Endpoint solo para consultar
export const queryPeopleWithProperties = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      distritos,
      areaMaxima,
      areaMinima,
      monImponibleMaximo,
      monImponibleMinimo,
      codigoBaseImponible,
      cedula,
      nombre,
    } = req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (distritos && Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    // Filtro por codigoBaseImponible
    if (codigoBaseImponible && Array.isArray(codigoBaseImponible) && codigoBaseImponible.length > 0) {
      whereClause.COD_BAS_IM = { [Op.in]: codigoBaseImponible };
    }

    if (cedula) {
      whereClause.CEDULA = cedula;
    }

    if (nombre) {
      const palabras = nombre.trim().split(/\s+/);
      const condiciones = palabras.map((palabra: string) => ({
        [Op.or]: [
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("NOM_PERSON")), {
            [Op.like]: `%${palabra.toLowerCase()}%`,
          }),
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("SEG_NOMBRE")), {
            [Op.like]: `%${palabra.toLowerCase()}%`,
          }),
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("APELLIDOS")), {
            [Op.like]: `%${palabra.toLowerCase()}%`,
          }),
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("SEG_APELLI")), {
            [Op.like]: `%${palabra.toLowerCase()}%`,
          }),
        ],
      }));
      whereClause[Op.and] = condiciones;
    }

    // Filtro por área
    const min = areaMinima !== undefined ? Number(areaMinima) : undefined;
    const max = areaMaxima !== undefined ? Number(areaMaxima) : undefined;

    const minMon =
      monImponibleMinimo !== undefined ? Number(monImponibleMinimo) : undefined;
    const maxMon =
      monImponibleMaximo !== undefined ? Number(monImponibleMaximo) : undefined;

    if (min !== undefined && max !== undefined) {
      // Si tengo ambos -> usar BETWEEN
      whereClause.AREA_REGIS = { [Op.between]: [min, max] };
    } else if (min !== undefined) {
      whereClause.AREA_REGIS = { [Op.gte]: min };
    } else if (max !== undefined) {
      whereClause.AREA_REGIS = { [Op.lte]: max };
    }

    if (minMon !== undefined && maxMon !== undefined) {
      // Si tengo ambos -> usar BETWEEN
      whereClause.MON_IMPONI = { [Op.between]: [minMon, maxMon] };
    } else if (minMon !== undefined) {
      whereClause.MON_IMPONI = { [Op.gte]: minMon };
    } else if (maxMon !== undefined) {
      whereClause.MON_IMPONI = { [Op.lte]: maxMon };
    }

    // MON_IMPONI ponerlo como filtro

    const personas = await FechaVigencia.findAll({
      attributes: [
        ["CEDULA", "cedula"],
        ["NOM_PERSON", "nombre"],
        ["APELLIDOS", "apellido"],
        ["CORREO_ELE", "correo"],
        ["NOM_DISTRI", "distrito"],
        ["NUM_FINCA", "numeroDeFinca"],
        ["AREA_REGIS", "areaDeLaPropiedad"],
        ["FEC_VIGENC", "fechaVigencia"],
        ["ESTADO", "estadoPropiedad"],
        ["MON_IMPONI", "montoImponible"],
        ["COD_BAS_IM", "codigoBaseImponible"],
      ],
      where: whereClause,
      raw: true,
    });

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeople:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

//Endpoint para consultar a las personas con morosidad
export const queryPeopleWithDebt = async (req: Request, res: Response) => {
  try {
    const { distritos, servicios, deudaMaxima, deudaMinima, cedula, nombre } =
      req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (distritos && Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    if (cedula) {
      whereClause.CEDULA = cedula;
    }

    if (nombre) {
      const palabras = nombre.split(" ");
      const condiciones = palabras.map((palabra: string) => ({
        [Op.or]: [
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("NOM_COMPLE")), {
            [Op.like]: `%${palabra.toLowerCase()}%`,
          }),
        ],
      }));

      whereClause[Op.and] = condiciones;
    }

    // Filtro por servicios
    if (servicios && Array.isArray(servicios) && servicios.length > 0) {
      whereClause.TIP_TRANSA = { [Op.in]: servicios };
    }

    // Filtro por área
    const min = deudaMinima !== undefined ? Number(deudaMinima) : undefined;
    const max = deudaMaxima !== undefined ? Number(deudaMaxima) : undefined;

    if (min !== undefined && max !== undefined) {
      // Si tengo ambos -> usar BETWEEN
      whereClause.MON_DEUDA = { [Op.between]: [min, max] };
    } else if (min !== undefined) {
      whereClause.MON_DEUDA = { [Op.gte]: min };
    } else if (max !== undefined) {
      whereClause.MON_DEUDA = { [Op.lte]: max };
    }

    const personas = await Morosidad.findAll({
      attributes: [
        ["CEDULA", "cedula"],
        ["NOM_COMPLE", "nombre"],
        ["NUM_FINCA", "numeroDeFinca"],
        ["CORREO_ELE", "correo"],
        ["NOM_DISTRI", "distrito"],
        ["DES_SERVIC", "servicio"],
        ["MON_DEUDA", "valorDeLaDeuda"],
        ["FEC_VENCIM", "fechaVencimiento"],
      ],
      where: whereClause,
      raw: true,
    });

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeople:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};
