import { Router } from "express";
import { body } from "express-validator";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyAuth,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  verifyAdmin,
} from "../handlers/authHandlers";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";
import { activitiMiddleware } from "../middleware/activitiMiddleware";

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

/*
Login Routes
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
  logoutUser
);

routerAuth.get(
  "/verify",
  authenticateMiddleware,
  inputErrorsMiddleware,
  verifyAuth
);

routerAuth.get(
  "/verifyAdmin",
  authenticateMiddleware,
  inputErrorsMiddleware,
  verifyAdmin
);

/**
 *  Rutas de Administrador
 */

routerAuth.get(
  "/getUsers",
  authenticateMiddleware,
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  getUsers
);

routerAuth.post(
  "/register",
  body("Nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("Correo").isEmail().withMessage("Correo inválido"),
  body("Rol").notEmpty().withMessage("El rol es obligatorio"),
  body("Clave")
    .isLength({ min: 6, max: 12 })
    .withMessage("La contraseña debe tener entre 6 y 12 caracteres"),
  authenticateMiddleware,
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  registerUser
);

routerAuth.delete(
  "/deleteUser",
  body("id").isInt().withMessage("ID de usuario inválido"),
  authenticateMiddleware,
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  deleteUser
);

routerAuth.get(
  "/getUserById/:id",
  authenticateMiddleware,
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  getUserById
);

routerAuth.put(
  "/updateUser/:id",
  body("Nombre").notEmpty().withMessage("Nombre inválido"),
  body("Correo").notEmpty().isEmail().withMessage("Correo inválido"),
  body("Rol").notEmpty().withMessage("Rol inválido"),
  body("Activo").notEmpty().withMessage("Activo inválido"),
  authenticateMiddleware,
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  updateUser
);

export default routerAuth;
