import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import {
  queryPeople,
  queryPeopleByArchive,
  queryPersonByCedula,
  queryPersonByName,
  sendEmails,
  sendWhatsApps,
} from "../handlers/messageHandlers";
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

// routerSendMessage.use(authenticate);

// routes.ts
routerSendMessage.post(
  "/queryPeople",
  body("distritos").optional().isArray(),
  body("servicios").optional().isArray(),
  body("deudaMinima").optional().isNumeric(),
  body("deudaMaxima").optional().isNumeric(),
  handlerInputErrors,
  queryPeople
);

routerSendMessage.post(
  "/queryPersonByCedula",
  handlerInputErrors,
  queryPersonByCedula
);

routerSendMessage.post(
  "/queryPersonByName",
  handlerInputErrors,
  queryPersonByName
);

routerSendMessage.post(
  "/queryPersonByArchive",
  handlerInputErrors,
  queryPeopleByArchive
);

routerSendMessage.post(
  "/sendMessage",
  body("destinatarios")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un array de correos"),
  handlerInputErrors,
  sendEmails
);

routerSendMessage.post("/sendWhatsapp", handlerInputErrors, sendWhatsApps);

export default routerSendMessage;
