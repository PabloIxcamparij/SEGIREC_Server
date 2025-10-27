import { Router } from "express";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  queryServiceCatalogo,
  queryBaseImponibleCatalogo,
  queryActivitiesQuery,
  queryActivitiesMessage
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
  "/activitiesOfQuery",
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  queryActivitiesQuery
);

routerUtils.get(
  "/activitiesOfMessage",
  authorizeRolesMiddleware("Administrador"),
  inputErrorsMiddleware,
  queryActivitiesMessage
);

export default routerUtils;
