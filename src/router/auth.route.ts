import { Router } from "express";
import { body } from "express-validator";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  loginUser,
  logoutUser,
  verifyAuth,
  verifyRol,
} from "../controller/auth.controller";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";

const routerAuth = Router();

routerAuth.post(
  "/login",
  body("Nombre").notEmpty().withMessage("Nombre inválido"),
  body("Clave").notEmpty().withMessage("La contraseña es obligatoria"),
  inputErrorsMiddleware,
  loginUser
);

routerAuth.post(
  "/logout",
  inputErrorsMiddleware,
  logoutUser
);

routerAuth.get(
  "/verifyAuth",
  authenticateMiddleware,
  verifyAuth
)
routerAuth.get(
  "/verifyRol",
  authenticateMiddleware,
  verifyRol,
);

export default routerAuth;