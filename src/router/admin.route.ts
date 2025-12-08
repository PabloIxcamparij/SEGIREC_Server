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

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const routerAdmin = Router();

routerAdmin.use(authenticateMiddleware);
routerAdmin.use(authorizeRolesMiddleware("Administrador"));

routerAdmin.get("/getUsers", inputErrorsMiddleware, getUsers);
routerAdmin.get("/getUserById/:id", inputErrorsMiddleware, getUserById);

routerAdmin.post(
  "/createUser",
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

// Endpoint que llamará React
routerAdmin.get("/reporte", (req, res) => {
  // Opcional: Relajar CSP solo para esta respuesta  
  const METABASE_SITE_URL = process.env.METABASE_SITE_URL;
  const METABASE_SECRET_KEY = process.env.METABASE_EMBED_SECRET_KEY;
  
  const payload = {
    resource: { dashboard: parseInt(process.env.METABASE_NUMBER_ID_DASHBOARD) },
    params: {}, 
    exp: Math.round(Date.now() / 1000) + (10 * 60)
  };

  const token = jwt.sign(payload, METABASE_SECRET_KEY!);
// En admin.route.ts
const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=false&theme=default`;  
  res.json({ url: iframeUrl });
});

export default routerAdmin;
