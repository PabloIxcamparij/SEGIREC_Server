import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import {
  sendEmails,
  sendWhatsApps,
} from "../handlers/messageHandlers";
import { authenticate } from "../middleware/auth";
import { queryPropiedadesByArchive, queryPropiedadesByCedula, queryPropiedadesByFilters, queryPropiedadesByName } from "../handlers/queryPeople";

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
  "/queryPropiedadesByFilters",
  body("distritos").optional().isArray(),
  body("areaMinima").optional().isNumeric(),
  body("areaMaxima").optional().isNumeric(),
  handlerInputErrors,
  queryPropiedadesByFilters
);

routerSendMessage.post(
  "/queryPropiedadesByCedula",
  body("cedula").isString().withMessage("Cédula es requerida"),
  handlerInputErrors,
  queryPropiedadesByCedula
);

routerSendMessage.post(
  "/queryPropiedadesByName",
  body("nombre").isString().withMessage("Nombre es requerido"),
  handlerInputErrors,
  queryPropiedadesByName
);

routerSendMessage.post(
  "/queryPropiedadesByArchive",
  body("cedulas").isArray().withMessage("Cédulas son requeridas"),
  handlerInputErrors,
  queryPropiedadesByArchive
);

/*-------------------------------------------------------------------------------------------------------------*/

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
