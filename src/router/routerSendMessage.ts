import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import {
  sendMessageOfPropiedades,
  sendMessageOfMorosidad,
  sendMessageMassive,
  // sendWhatsApps,
} from "../handlers/messageHandlers";
import { authenticate } from "../middleware/auth";
import { queryPeopleWithDebt, queryPeopleWithProperties } from "../handlers/queryPeople";
import { authorizeRoles } from "../middleware/rol";

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

routerSendMessage.use(authenticate);

// Rutas para la consulta de propiedades y personas

routerSendMessage.post(
  "/queryPeopleWithProperties",
  authorizeRoles("Propiedades"),
  handlerInputErrors,
  queryPeopleWithProperties
);

routerSendMessage.post(
  "/queryPeopleWithDebt",
  authorizeRoles("Morosidad"),
  handlerInputErrors,
  queryPeopleWithDebt
);

/*-------------------------------------------------------------------------------------------------------------*/

routerSendMessage.post(
  "/sendMessageOfPropiedades",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un array de correos"),
  authorizeRoles("Propiedades"),
  handlerInputErrors,
  sendMessageOfPropiedades,
);

routerSendMessage.post(
  "/sendMessageOfMorosidad",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un array de correos"),
  authorizeRoles("Morosidad"),
  handlerInputErrors,
  sendMessageOfMorosidad,
);

routerSendMessage.post(
  "/sendMessageMassive",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un array de correos"),
  body("mensaje").notEmpty().withMessage("Se requiere un mensaje un mensaje valido"),
  body("asunto").notEmpty().withMessage("Se requiere un mensaje un asunto valido"),
  handlerInputErrors,
  sendMessageMassive,
);

// routerSendMessage.post("/sendWhatsapp", handlerInputErrors, sendWhatsApps);

export default routerSendMessage;
