import { Request, Response } from "express";
import CatalogoBaseImponible from "../models/CatalogoBaseImponible.model";
import CatalogoService from "../models/CatalogoService.model";

// Endpoint para cargar los servicios de la tabla catalogo de la base de datos
export const queryServiceCatalogo = async (req: Request, res: Response) => {
  try {

    const services = await CatalogoService.findAll({
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

export const queryBaseImponibleCatalogo = async (req: Request, res: Response) => {
  try {

    const services = await CatalogoBaseImponible.findAll({
      attributes: [
        ['Codigo', 'value'],
        ['Descripción', 'label'],
      ],
      raw: true,
    });

    return res.status(200).json(services);
    
  } catch (error) {
    console.error("Error en queryPerson:", error);
    return res.status(500).json({ error: "Error interno en el servidor." });
  }
};