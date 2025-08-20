import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "./middleware";
import { queryFiltered, sendEmails } from "./handlers/emailHandlerFilters";

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
 *               valor:
 *                 type: object
 *                 properties:
 *                   menor:
 *                     type: number
 *                   mayor:
 *                     type: number
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

router.post(
  "/query-filtered",
  body("ciudad").optional().isString(),
  body("servicio").optional().isString(),
  body("valor").optional().isObject(),
  handlerInputErrors,
  queryFiltered
);

router.post(
  "/send-emails",
  body("destinatarios").isArray({ min: 1 }).withMessage("Debe enviar un array de correos"),
  handlerInputErrors,
  sendEmails
);

router.post("/login",
  body("correo").isEmail().withMessage("Correo inválido"),
  body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  handlerInputErrors,
  async (req, res) => {
    // Aquí iría la lógica de autenticación
    res.status(200).json({ message: "Login successful" });
  }
);

export default router;
