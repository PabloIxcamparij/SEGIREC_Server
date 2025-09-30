import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import ServiceCatalogo from "../models/Service_Catalogo.model";

// Endpoint para cargar los servicios de la tabla catalogo de la base de datos
export const queryServiceCatalogo = async (req: Request, res: Response) => {
  try {

    const services = await ServiceCatalogo.findAll({
      attributes: [
        ['COD_SERVIC', 'value'],
        ['DES_SERVIC', 'label'],
      ],
      raw: true,
    });

    return res.status(200).json(services);
    
  } catch (error) {
    console.error("Error en queryPerson:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};

