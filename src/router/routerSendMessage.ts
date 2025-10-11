import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import {
  sendEmails,
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
  handlerInputErrors,
  queryPeopleWithProperties
);

routerSendMessage.post(
  "/queryPeopleWithDebt",
  body("distritos").optional().isArray(),
  body("servicios").optional().isArray(),
  body("deudaMinima").optional().isNumeric(),
  body("deudaMaxima").optional().isNumeric(),
  authorizeRoles("Morosidad"),
  handlerInputErrors,
  queryPeopleWithDebt
);

/*-------------------------------------------------------------------------------------------------------------*/

routerSendMessage.post(
  "/sendMessage",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un array de correos"),
  handlerInputErrors,
  sendEmails
);

// routerSendMessage.post("/sendWhatsapp", handlerInputErrors, sendWhatsApps);

export default routerSendMessage;
