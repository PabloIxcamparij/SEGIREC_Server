import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import { queryPeople, queryPerson, sendEmails } from "../handlers/messageHandlers";
import { authenticate } from "../middleware/auth";

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


// routes.ts
routerSendMessage.post(
  "/queryPeople",
  body("ciudad").optional().isString(),
  body("servicio").optional().isString(),
  body("deudaMinima").optional().isNumeric(),
  body("deudaMaxima").optional().isNumeric(),
  handlerInputErrors,
  queryPeople
);

routerSendMessage.post(
  "/queryPerson",
  handlerInputErrors,
  queryPerson
);

routerSendMessage.post(
  "/sendMessage",
  body("destinatarios").isArray({ min: 1 }).withMessage("Debe enviar un array de correos"),
  handlerInputErrors,
  sendEmails
);

export default routerSendMessage;
