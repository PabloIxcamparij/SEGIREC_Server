import { Router } from "express";
import { body } from "express-validator";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  loginUser,
  logoutUser,
  verifyRol,
} from "../controller/auth.controller";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";

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
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       500:
 *         description: Error logging out user
 */

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify user authentication
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User is authenticateMiddlewared
 *       401:
 *         description: User is not authenticateMiddlewared
 */

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
  "/verifyRol",
  authenticateMiddleware,
  verifyRol,
);

export default routerAuth;