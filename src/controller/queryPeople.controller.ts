import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import Morosidad from "../models/Morosidad.model";
import FechaVigencia from "../models/FechaVigencia.model";

// ===================================================================
// Descripción general
// -------------------------------------------------------------------
// Este módulo contiene los métodos para realizar consultas sobre las
// tablas `FechaVigencia` y `Morosidad`, aplicando filtros dinámicos
// según los criterios recibidos en la solicitud HTTP.
// ===================================================================

// ===================================================================
// Consulta registros en la tabla FechaVigencia aplicando filtros
// relacionados con propiedades y sus características.
// ===================================================================
export const queryPeopleWithProperties = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      distritos,
      areaMaxima,
      areaMinima,
      numeroFinca,
      numeroDerecho,
      monImponibleMaximo,
      monImponibleMinimo,
      codigoBaseImponible,
      cedula,
      nombre,
      variasPropiedades,
      conDeudas,
    } = req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    // Filtro por código base imponible
    if (Array.isArray(codigoBaseImponible) && codigoBaseImponible.length > 0) {
      whereClause.COD_BAS_IM = { [Op.in]: codigoBaseImponible };
    }

    // Filtro por estado de deuda
    if (conDeudas) {
      whereClause.ESTADO = { [Op.ne]: "VIGENTE" };
    }

    // Filtros directos por identificadores
    if (cedula) whereClause.CEDULA = cedula;
    if (numeroDerecho) whereClause.NUM_DERECH = numeroDerecho;
    if (numeroFinca) whereClause.NUM_FINCA = numeroFinca;

    // Filtro por nombre
    if (nombre) {
      whereClause[Op.and] = buildNameFilter(nombre, [
        "NOM_PERSON",
        "SEG_NOMBRE",
        "APELLIDOS",
        "SEG_APELLI",
      ]);
    }

    // Filtros por rangos de área y monto imponible

    if (areaMaxima || areaMinima) {
      const areaFilter = buildRangeFilter(
        Number(areaMinima),
        Number(areaMaxima)
      );
      if (areaFilter) whereClause.AREA_REGIS = areaFilter;
    }

    if (monImponibleMaximo || monImponibleMinimo) {
      const montoFilter = buildRangeFilter(
        Number(monImponibleMinimo),
        Number(monImponibleMaximo)
      );
      if (montoFilter) whereClause.MON_IMPONI = montoFilter;
    }

    // Filtro por múltiples propiedades
    if (variasPropiedades) {
      const personasConteo = await FechaVigencia.findAll({
        attributes: [
          "CEDULA",
          [Sequelize.fn("COUNT", Sequelize.col("NUM_FINCA")), "finca_count"],
        ],
        where: whereClause,
        group: ["CEDULA"],
        having: Sequelize.where(
          Sequelize.fn("COUNT", Sequelize.col("NUM_FINCA")),
          { [Op.gt]: 1 }
        ),
        raw: true,
      });

      const cedulasConMultiples = personasConteo.map((p: any) => p.CEDULA);
      if (cedulasConMultiples.length === 0) {
        return res.status(200).json({ personas: [] });
      }
      whereClause.CEDULA = { [Op.in]: cedulasConMultiples };
    }

    // Consulta principal
    const personas = await FechaVigencia.findAll({
      attributes: [
        ["CEDULA", "cedula"],
        [
          Sequelize.fn(
            "CONCAT",
            Sequelize.col("NOM_PERSON"),
            " ",
            Sequelize.col("SEG_NOMBRE"),
            " ",
            Sequelize.col("APELLIDOS"),
            " ",
            Sequelize.col("SEG_APELLI")
          ),
          "nombre",
        ],
        ["CORREO_ELE", "correo"],
        ["NOM_DISTRI", "distrito"],
        ["NUM_FINCA", "numeroDeFinca"],
        ["AREA_REGIS", "areaDeLaPropiedad"],
        ["FEC_VIGENC", "fechaVigencia"],
        ["ESTADO", "estadoPropiedad"],
        ["MON_IMPONI", "montoImponible"],
        ["NUM_DERECH", "numeroDeDerecho"],
        ["COD_BAS_IM", "codigoBaseImponible"],
      ],
      where: whereClause,
      raw: true,
    });

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeopleWithProperties:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

// ===================================================================
// Consulta registros en la tabla Morosidad aplicando filtros
// relacionados con deudas o servicios pendientes.
// ===================================================================
export const queryPeopleWithDebt = async (req: Request, res: Response) => {
  try {
    const {
      distritos,
      servicios,
      numeroFinca,
      deudaMaxima,
      deudaMinima,
      cedula,
      nombre,
      conDeudas,
    } = req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    // Filtro por deudas
    if (conDeudas) {
      whereClause.DIA_VENCIMI = { [Op.gt]: 0 };
    }

    // Filtros directos por cédula y finca
    if (cedula) whereClause.CEDULA = cedula;
    if (numeroFinca) whereClause.NUM_FINCA = numeroFinca;

    // Filtro por nombre
    if (nombre) {
      whereClause[Op.and] = buildNameFilter(nombre, ["NOM_COMPLE"]);
    }

    // Filtro por tipo de servicio
    if (Array.isArray(servicios) && servicios.length > 0) {
      whereClause.TIP_TRANSA = { [Op.in]: servicios };
    }

    if (deudaMaxima || deudaMinima) {
      // Filtro por rango de deuda
      const deudaFilter = buildRangeFilter(
        Number(deudaMinima),
        Number(deudaMaxima)
      );
      if (deudaFilter) whereClause.MON_DEUDA = deudaFilter;
    }

    // Consulta principal
    const personas = await Morosidad.findAll({
      attributes: [
        ["CEDULA", "cedula"],
        ["NOM_COMPLE", "nombre"],
        ["NUM_CUENTA", "numeroDeCuenta"],
        ["NUM_FINCA", "numeroDeFinca"],
        ["CORREO_ELE", "correo"],
        ["NOM_DISTRI", "distrito"],
        ["TIP_TRANSA", "codigoServicio"],
        ["DES_SERVIC", "servicio"],
        ["MON_DEUDA", "valorDeLaDeuda"],
        ["FEC_VENCIM", "fechaVencimiento"],
        ["PERIODO", "periodo"],
        ["TELEFONO1", "telefono"],
        ["DIRECCION1", "direccion"],
      ],
      where: whereClause,
      raw: true,
    });

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeopleWithDebt:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

// Función auxiliar: construcción dinámica de filtros generales
function buildRangeFilter(min?: number, max?: number) {
  if (min !== undefined && max !== undefined) {
    return { [Op.between]: [min, max] };
  }
  if (min !== undefined) {
    return { [Op.gte]: min };
  }
  if (max !== undefined) {
    return { [Op.lte]: max };
  }
  return undefined;
}

// Función auxiliar: filtro por nombre (coincidencias parciales)
function buildNameFilter(nombre: string, columnas: string[]) {
  const palabras = nombre.trim().split(/\s+/);
  return palabras.map((palabra) => ({
    [Op.or]: columnas.map((col) =>
      Sequelize.where(Sequelize.fn("LOWER", Sequelize.col(col)), {
        [Op.like]: `%${palabra.toLowerCase()}%`,
      })
    ),
  }));
}
