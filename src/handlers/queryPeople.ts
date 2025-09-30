import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import PropiedadesNoDeclaradas from "../models/Propiedades_No_Declaradas";
import Morosidad from "../models/Morosidad.model";

//Endpoint solo para consultar
export const queryPropiedadesByFilters = async (
  req: Request,
  res: Response
) => {
  try {
    const { distritos, areaMaxima, areaMinima } = req.body;

    const whereClause: any = {};

    // Filtro por distritos
    if (distritos && Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
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

    const personas = await PropiedadesNoDeclaradas.findAll({
      attributes: [
        ["CEDULA", "cedula"],
        ["NOM_PERSON", "nombre"],
        ["APELLIDOS", "apellido"],
        ["CORREO_ELE", "correo"],
        ["NOM_DISTRI", "distrito"],
        ["AREA_REGIS", "areaDeLaPropiedad"],
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

// Endpoint para consultar una persona por su cédula
export const queryPropiedadesByCedula = async (req: Request, res: Response) => {
  try {
    const { cedula, typeQuery } = req.body;
    console.log(typeQuery);
    let persona;

    if (typeQuery === "Propiedades") {
      persona = await PropiedadesNoDeclaradas.findOne({
        attributes: [
          ["CEDULA", "cedula"],
          ["NOM_PERSON", "nombre"],
          ["APELLIDOS", "apellido"],
          ["CORREO_ELE", "correo"],
          ["NOM_DISTRI", "distrito"],
          ["AREA_REGIS", "areaDeLaPropiedad"],
        ],
        where: { CEDULA: cedula },
        raw: true,
      });
    } else if (typeQuery === "Morosidad") {
      persona = await Morosidad.findOne({
        attributes: [
          ["CEDULA", "cedula"],
          ["NOM_COMPLE", "nombre"],
          ["CORREO_ELE", "correo"],
          ["NOM_DISTRI", "distrito"],
          ["DES_SERVIC", "servicio"],
          ["MON_DEUDA", "valorDeLaDeuda"],
          ["FEC_VENCIM", "fechaVencimiento"],
        ],
        where: { CEDULA: cedula },
        raw: true,
      });
    }

    if (!persona) {
      return res.status(404).json({ error: "Persona no encontrada." });
    }
    return res.status(200).json(persona);
  } catch (error) {
    console.error("Error en queryPerson:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

// Endpoint para consultar una persona por su nombre
export const queryPropiedadesByName = async (req: Request, res: Response) => {
  try {
    const { nombre, typeQuery } = req.body;
    let personas;

    if (!nombre) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un nombre o apellido." });
    }

    const palabras = nombre.trim().split(/\s+/);

    if (typeQuery === "Propiedades") {
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

      personas = await PropiedadesNoDeclaradas.findAll({
        attributes: [
          ["CEDULA", "cedula"],
          ["NOM_PERSON", "nombre"],
          ["APELLIDOS", "apellido"],
          ["CORREO_ELE", "correo"],
          ["NOM_DISTRI", "distrito"],
          ["AREA_REGIS", "areaDeLaPropiedad"],
        ],
        where: {
          [Op.and]: condiciones,
        },
        raw: true,
      });
    } else if (typeQuery === "Morosidad") {
      const condiciones = palabras.map((palabra: string) => ({
        [Op.or]: [
          Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("NOM_COMPLE")), {
            [Op.like]: `%${palabra.toLowerCase()}%`,
          }),
        ],
      }));

      personas = await Morosidad.findAll({
        attributes: [
          ["CEDULA", "cedula"],
          ["NOM_COMPLE", "nombre"],
          ["CORREO_ELE", "correo"],
          ["NOM_DISTRI", "distrito"],
          ["DES_SERVIC", "servicio"],
          ["MON_DEUDA", "valorDeLaDeuda"],
          ["FEC_VENCIM", "fechaVencimiento"],
        ],
        where: {
          [Op.and]: condiciones,
        },
        raw: true,
      });
    }
    if (!personas || personas.length === 0) {
      return res.status(404).json({ error: "No se encontraron personas." });
    }

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPersonByName:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

// Endpoint para consultar las personas por medio de un archivo
export const queryPropiedadesByArchive = async (
  req: Request,
  res: Response
) => {
  try {
    const { cedulas, typeQuery } = req.body;
    let personas;

    // Verificar que el body contenga un array de cédulas
    if (!Array.isArray(cedulas) || cedulas.length === 0) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un array de cédulas." });
    }
    if (typeQuery === "Propiedades") {
      personas = await PropiedadesNoDeclaradas.findAll({
        attributes: [
          ["CEDULA", "cedula"],
          ["NOM_PERSON", "nombre"],
          ["APELLIDOS", "apellido"],
          ["CORREO_ELE", "correo"],
          ["NOM_DISTRI", "distrito"],
          ["AREA_REGIS", "areaDeLaPropiedad"],
        ],
        where: {
          CEDULA: {
            [Op.in]: cedulas,
          },
        },
        raw: true,
      });
    } else if (typeQuery === "Morosidad") {
      personas = await Morosidad.findAll({
        attributes: [
          ["CEDULA", "cedula"],
          ["NOM_COMPLE", "nombre"],
          ["CORREO_ELE", "correo"],
          ["NOM_DISTRI", "distrito"],
          ["DES_SERVIC", "servicio"],
          ["MON_DEUDA", "valorDeLaDeuda"],
          ["FEC_VENCIM", "fechaVencimiento"],
        ],
        where: {
          CEDULA: {
            [Op.in]: cedulas,
          },
        },
        raw: true,
      });
    }

    if (!personas || personas.length === 0) {
      return res.status(404).json({
        error: "No se encontraron personas con las cédulas proporcionadas.",
      });
    }

    return res.status(200).json({ personas });
  } catch (error) {
    console.error("Error en queryPeopleByFile:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

//Endpoint para consultar a las personas con morosidad
export const queryPeopleWithDebt = async (req: Request, res: Response) => {
  try {
    const { distritos, servicios, deudaMaxima, deudaMinima } = req.body;

    console.log(deudaMinima, deudaMaxima)
    
    const whereClause: any = {};

    // Filtro por distritos
    if (distritos && Array.isArray(distritos) && distritos.length > 0) {
      whereClause.NOM_DISTRI = { [Op.in]: distritos };
    }

    // Filtro por servicios
    if (servicios && Array.isArray(servicios) && servicios.length > 0) {
      whereClause.DES_SERVIC = { [Op.in]: servicios };
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
