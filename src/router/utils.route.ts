import { Router } from "express";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  queryActivities,
  queryServiceCatalogo,
  queryBaseImponibleCatalogo,
} from "../controller/utils.controller";
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

routerUtils.get(
  "/activities",
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  queryActivities
);

export default routerUtils;
