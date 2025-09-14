import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import { registerUser, loginUser } from "../handlers/authHandlers";

const routerAuth = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       401:
 *         description: Invalid email or password
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Error registering user
 */


/*
Login Routes
*/

routerAuth.post(
  "/register",
  body("Nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("Correo").isEmail().withMessage("Correo inválido"),
  body("Rol").notEmpty().withMessage("El rol es obligatorio"),
  body("Clave").isLength({ min: 6, max: 12 }).withMessage("La contraseña debe tener entre 6 y 12 caracteres"),
  handlerInputErrors,
  registerUser
);

routerAuth.post(
  "/login",
  body("Nombre").notEmpty().withMessage("Nombre inválido"),
  body("Clave").notEmpty().withMessage("La contraseña es obligatoria"),
  handlerInputErrors,
  loginUser
);

export default routerAuth;
