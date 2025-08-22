import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "./middleware";
import { queryFiltered, sendEmails } from "./handlers/emailHandlerFilters";
import { registerUser, loginUser } from "./handlers/authHandlers";

const router = Router();

/**
 * @swagger
 * /api/products/query-filtered:
 *   post:
 *     summary: Consultar usuarios filtrados
 *     tags: [Emails]
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
 * /api/products/send-emails:
 *   post:
 *     summary: Enviar correos a usuarios seleccionados
 *     tags: [Emails]
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

/**
 * @swagger
 * /login:
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
 * /register:
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

// routes.ts
router.post(
  "/query-filtered",
  body("ciudad").optional().isString(),
  body("servicio").optional().isString(),
  body("deudaMinima").optional().isNumeric(),
  body("deudaMaxima").optional().isNumeric(),
  handlerInputErrors,
  queryFiltered
);

router.post(
  "/send-emails",
  body("destinatarios").isArray({ min: 1 }).withMessage("Debe enviar un array de correos"),
  handlerInputErrors,
  sendEmails
);

/*
Login Routes
*/

router.post(
  "/register",
  body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
  body("correo").isEmail().withMessage("Correo inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  handlerInputErrors,
  registerUser
);

router.post(
  "/login",
  body("correo").isEmail().withMessage("Correo inválido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  handlerInputErrors,
  loginUser
);


export default router;
