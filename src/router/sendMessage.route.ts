import { Router } from "express";
import { body } from "express-validator";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  sendMessageOfPropiedades,
  sendMessageOfMorosidad,
  sendMessageMassive,
} from "../controller/message.controller";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";
import { activitiMiddleware } from "../middleware/activitiMiddleware";
import { emailNotificationMiddleware } from "../middleware/emailNotificationMiddleware";
import { confirmCodePrioritaryMessage, requestCodePrioritaryMessage } from "../controller/messagePriority.controller";

const sendMessage = Router();
sendMessage.use(authenticateMiddleware);

sendMessage.post(
  "/sendMessageOfPropiedades",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un lista de correos"),
  authorizeRolesMiddleware("Propiedades"),
  emailNotificationMiddleware,
  inputErrorsMiddleware,
  activitiMiddleware(
    "EnvioMensajes",
    "Se hizo un envio de mensajes para las personas de la tabla Fecha_Vigencia"
  ),
  sendMessageOfPropiedades
);

sendMessage.post(
  "/sendMessageOfMorosidad",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un lista de correos"),
  authorizeRolesMiddleware("Morosidad"),
  // emailNotificationMiddleware,
  inputErrorsMiddleware,
  // activitiMiddleware(
  //   "EnvioMensajes",
  //   "Se hizo un envio de mensajes para las personas de la tabla MOROSIDAD"
  // ),
  sendMessageOfMorosidad
);

sendMessage.post(
  "/sendMessageMassive",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar una lista de correos"),
  body("mensaje")
    .notEmpty()
    .withMessage("Se requiere un mensaje un mensaje valido"),
  body("asunto")
    .notEmpty()
    .withMessage("Se requiere un mensaje un asunto valido"),
  emailNotificationMiddleware,
  inputErrorsMiddleware,
  activitiMiddleware(
    "EnvioMensajes",
    "Se hizo un envio de mensajes de forma masiva"
  ),
  sendMessageMassive
);

sendMessage.post(
  "/requestCodePrioritaryMessage",
  inputErrorsMiddleware,
  requestCodePrioritaryMessage
);

sendMessage.post(
  "/confirmCodePrioritaryMessage",
  body("code")
    .isLength({ min: 6, max: 6 })
    .withMessage("El código debe tener 6 caracteres"),
  inputErrorsMiddleware,
  confirmCodePrioritaryMessage
);

export default sendMessage;
