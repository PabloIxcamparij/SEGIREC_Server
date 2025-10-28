import { Router } from "express";
import { activitiMiddleware } from "../middleware/activitiMiddleware";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";
import { queryPeopleWithDebt, queryPeopleWithProperties } from "../controller/queryPeople.controller";

const queryPeople = Router();

/**
 * @swagger
 * /message/queryPeople:
 *   post:
 *     summary: Consultar usuarios filtrados
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ciudad:
 *                 type: string
 *               servicio:
 *                 type: string
 *               deudaMinima:
 *                 type: number
 *                 minimum: 0
 *               deudaMaxima:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Lista de personas filtradas
 */

/**
 * @swagger
 * /message/sendMessage:
 *   post:
 *     summary: Enviar correos a usuarios seleccionados
 *     tags: [Message]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destinatarios:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Correos enviados correctamente
 */

// Middleware de autenticación para proteger las rutas

queryPeople.use(authenticateMiddleware);

// Rutas para la consulta de propiedades y personas

queryPeople.post(
  "/queryPeopleWithProperties",
  authorizeRolesMiddleware("Propiedades"),
  inputErrorsMiddleware,
  activitiMiddleware("Consulta", "De la tabla Propiedades"),
  queryPeopleWithProperties
);

queryPeople.post(
  "/queryPeopleWithDebt",
  authorizeRolesMiddleware("Morosidad"),
  inputErrorsMiddleware,
  activitiMiddleware("Consulta", "De la tabla Morosidad"),
  queryPeopleWithDebt
);

export default queryPeople;
