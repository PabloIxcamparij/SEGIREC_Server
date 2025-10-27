import { Router } from "express";
import { body } from "express-validator";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  registerUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from "../controller/admin.controller";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";

const routerAdmin = Router();

routerAdmin.use(authenticateMiddleware);
routerAdmin.use(authorizeRolesMiddleware("Administrador"));

routerAdmin.get("/getUsers", inputErrorsMiddleware, getUsers);
routerAdmin.get("/getUserById/:id", inputErrorsMiddleware, getUserById);

routerAdmin.post(
  "/register",
  body("Nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("Correo").isEmail().withMessage("Correo inválido"),
  body("Rol").notEmpty().withMessage("El rol es obligatorio"),
  body("Clave")
    .isLength({ min: 6, max: 12 })
    .withMessage("La contraseña debe tener entre 6 y 12 caracteres"),
  inputErrorsMiddleware,
  registerUser
);

routerAdmin.put(
  "/updateUser/:id",
  body("Nombre").notEmpty().withMessage("Nombre inválido"),
  body("Correo").notEmpty().isEmail().withMessage("Correo inválido"),
  body("Rol").notEmpty().withMessage("Rol inválido"),
  body("Activo").notEmpty().withMessage("Activo inválido"),
  inputErrorsMiddleware,
  updateUser
);

routerAdmin.delete(
  "/deleteUser",
  body("id").isInt().withMessage("ID de usuario inválido"),
  inputErrorsMiddleware,
  deleteUser
);

export default routerAdmin;
