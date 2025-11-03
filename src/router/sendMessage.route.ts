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

const sendMessage = Router();

sendMessage.use(authenticateMiddleware);
sendMessage.use(emailNotificationMiddleware)

sendMessage.post(
  "/sendMessageOfPropiedades",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un lista de correos"),
  authorizeRolesMiddleware("Propiedades"),
  inputErrorsMiddleware,
  activitiMiddleware("EnvioMensajes", "Se hizo un envio de mensajes para las personas de la tabla Fecha_Vigencia"),
  sendMessageOfPropiedades,
);

sendMessage.post(
  "/sendMessageOfMorosidad",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar un lista de correos"),
  authorizeRolesMiddleware("Morosidad"),
  inputErrorsMiddleware,
  activitiMiddleware("EnvioMensajes", "Se hizo un envio de mensajes para las personas de la tabla MOROSIDAD"),
  sendMessageOfMorosidad,
);

sendMessage.post(
  "/sendMessageMassive",
  body("personas")
    .isArray({ min: 1 })
    .withMessage("Debe enviar una lista de correos"),
  body("mensaje").notEmpty().withMessage("Se requiere un mensaje un mensaje valido"),
  body("asunto").notEmpty().withMessage("Se requiere un mensaje un asunto valido"),
  inputErrorsMiddleware,
  activitiMiddleware("EnvioMensajes", "Se hizo un envio de mensajes de forma masiva"),
  sendMessageMassive,
);

export default sendMessage;
