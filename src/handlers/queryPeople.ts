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
      numeroFinca,
      numeroDerecho,
      monImponibleMaximo,
      monImponibleMinimo,
      codigoBaseImponible,
      cedula,
      nombre,
      unicamenteConVariasPropiedades,
      unicamenteConDeudas,
    } = req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (distritos && Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    // Filtro por codigoBaseImponible
    if (
      codigoBaseImponible &&
      Array.isArray(codigoBaseImponible) &&
      codigoBaseImponible.length > 0
    ) {
      whereClause.COD_BAS_IM = { [Op.in]: codigoBaseImponible };
    }

    // Filtro para personas con deudas vigentes
    if (unicamenteConDeudas) {
      whereClause.ESTADO = { [Op.ne]: "VIGENTE" }; // Ejemplo: Filtrar propiedades que no están pagadas
    }

    // Filtro por cedula
    if (cedula) {
      whereClause.CEDULA = cedula;
    }

    if (numeroDerecho) {
      whereClause.NUM_DERECH = numeroDerecho;
    }

    if (numeroFinca) {
      whereClause.NUM_FINCA = numeroFinca;
    }

    // Filtro por nombre
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

    if (min !== undefined && max !== undefined) {
      // Si tengo ambos -> usar BETWEEN
      whereClause.AREA_REGIS = { [Op.between]: [min, max] };
    } else if (min !== undefined) {
      whereClause.AREA_REGIS = { [Op.gte]: min };
    } else if (max !== undefined) {
      whereClause.AREA_REGIS = { [Op.lte]: max };
    }

    // Filtro por monto imponible
    const minMon =
      monImponibleMinimo !== undefined ? Number(monImponibleMinimo) : undefined;
    const maxMon =
      monImponibleMaximo !== undefined ? Number(monImponibleMaximo) : undefined;

    if (minMon !== undefined && maxMon !== undefined) {
      // Si tengo ambos -> usar BETWEEN
      whereClause.MON_IMPONI = { [Op.between]: [minMon, maxMon] };
    } else if (minMon !== undefined) {
      whereClause.MON_IMPONI = { [Op.gte]: minMon };
    } else if (maxMon !== undefined) {
      whereClause.MON_IMPONI = { [Op.lte]: maxMon };
    }

    // Filtro para personas con múltiples propiedades
    if (unicamenteConVariasPropiedades) {
      // 1. Consulta de conteo: Agrupa por CEDULA y cuenta las fincas
      const personasConteo = await FechaVigencia.findAll({
        attributes: [
          "CEDULA",
          [Sequelize.fn("COUNT", Sequelize.col("NUM_FINCA")), "finca_count"],
        ],
        // Aplicamos los filtros básicos (distrito, COD_BAS_IM, deuda) en el WHERE de la primera consulta
        where: whereClause,
        group: ["CEDULA"],
        having: Sequelize.where(
          Sequelize.fn("COUNT", Sequelize.col("NUM_FINCA")),
          { [Op.gt]: 1 }
        ),
        raw: true,
      });

      // 2. Extraer las cédulas resultantes
      const cedulasConMultiples = personasConteo.map((p: any) => p.CEDULA);

      // Si no hay personas que cumplan el criterio de múltiples propiedades, retornamos vacío
      if (cedulasConMultiples.length === 0) {
        return res.status(200).json({ personas: [] });
      }

      // 3. APLICAR el filtro de cédulas a la cláusula principal
      whereClause.CEDULA = { [Op.in]: cedulasConMultiples };

      // NOTA: Si también se había ingresado una CEDULA específica en el formulario,
      // el filtro GROUP BY solo se aplicó a ESA cédula. El `Op.in` ahora incluirá solo
      // la cédula específica (si pasó el conteo) o una lista de cédulas.
      // Si el usuario especificó una cédula, el `whereClause` ya la tiene y la
      // primera consulta solo cuenta ESA. El filtro es correcto.
    }

    // MON_IMPONI ponerlo como filtro

    const personas = await FechaVigencia.findAll({
      attributes: [
        ["CEDULA", "cedula"],
      [
      FechaVigencia.sequelize.fn(
        "CONCAT",
        FechaVigencia.sequelize.col("NOM_PERSON"),
        " ", 
        FechaVigencia.sequelize.col("SEG_NOMBRE"),
        " ", 
        FechaVigencia.sequelize.col("APELLIDOS"),
        " ",
        FechaVigencia.sequelize.col("SEG_APELLI")
      ),
      "nombre", // Alias final para la variable en JavaScript
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
    console.error("Error en queryPeople:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

//Endpoint para consultar a las personas con morosidad
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
      unicamenteConDeudas,
    } = req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (distritos && Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    if (unicamenteConDeudas) {
      whereClause.DIA_VENCIMI = { [Op.gt]: 0 };
    }

    // Filtro por cédula
    if (cedula) {
      whereClause.CEDULA = cedula;
    }
    
    if (numeroFinca) {
      whereClause.NUM_FINCA = numeroFinca;
    }

    // Filtro por nombre
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
        ["NUM_CUENTA", "numeroDeCuenta"],
        ["NUM_FINCA", "numeroDeFinca"],
        ["CORREO_ELE", "correo"],
        ["NOM_DISTRI", "distrito"],
        ["TIP_TRANSA", "CodServicio"],
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
    console.error("Error en queryPeople:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};
