import { Router } from "express";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  queryBaseImponibleCatalogo,
  queryServiceCatalogo,
} from "../handlers/utilsHandlers";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";

const routerUtils = Router();

routerUtils.use(authenticateMiddleware);

routerUtils.get(
  "/service",
  authorizeRolesMiddleware("Morosidad"),
  inputErrorsMiddleware,
  queryServiceCatalogo
);
routerUtils.get(
  "/baseImponible",
  authorizeRolesMiddleware("Propiedades"),
  inputErrorsMiddleware,
  queryBaseImponibleCatalogo
);

export default routerUtils;
