import { Router } from "express";
import { body } from "express-validator";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  sendMessageOfPropiedades,
  sendMessageOfMorosidad,
  sendMessageMassive,
  // sendWhatsApps,
} from "../handlers/messageHandlers";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";
import { queryPeopleWithDebt, queryPeopleWithProperties } from "../handlers/queryPeople";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";
import { activitiMiddleware } from "../middleware/activitiMiddleware";

const routerSendMessage = Router();

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

routerSendMessage.use(authenticateMiddleware);

// Rutas para la consulta de propiedades y personas

routerSendMessage.post(
  "/queryPeopleWithProperties",
  authorizeRolesMiddleware("Propiedades"),
  inputErrorsMiddleware,
  activitiMiddleware("Consulta", "De la tabla Morosidad", 0),
  queryPeopleWithProperties
);

routerSendMessage.post(
  "/queryPeopleWithDebt",
  authorizeRolesMiddleware("Morosidad"),
  inputErrorsMiddleware,
  queryPeopleWithDebt
);

/*-------------------------------------------------------------------------------------------------------------*/

routerSendMessage.post(
  "/sendMessageOfPropiedades",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un lista de correos"),
  authorizeRolesMiddleware("Propiedades"),
  inputErrorsMiddleware,
  sendMessageOfPropiedades,
);

routerSendMessage.post(
  "/sendMessageOfMorosidad",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un lista de correos"),
  authorizeRolesMiddleware("Morosidad"),
  inputErrorsMiddleware,
  sendMessageOfMorosidad,
);

routerSendMessage.post(
  "/sendMessageMassive",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar una lista de correos"),
  body("mensaje").notEmpty().withMessage("Se requiere un mensaje un mensaje valido"),
  body("asunto").notEmpty().withMessage("Se requiere un mensaje un asunto valido"),
  inputErrorsMiddleware,
  sendMessageMassive,
);

// routerSendMessage.post("/sendWhatsapp", inputErrorsMiddleware, sendWhatsApps);

export default routerSendMessage;
