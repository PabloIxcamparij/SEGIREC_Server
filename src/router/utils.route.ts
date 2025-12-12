import { Router } from "express";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import {
  queryServiceCatalogo,
  queryBaseImponibleCatalogo,
  queryActivitiesQuery,
  queryActivitiesMessage,
  queryAsuntosCorreo,
  generateReport
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
  "/asuntosCorreo",
  authorizeRolesMiddleware("EnvioMasivo"),
  inputErrorsMiddleware,
  queryAsuntosCorreo
);

routerUtils.get(
  "/activitiesOfQuery",
  authorizeRolesMiddleware("Auditor"),
  inputErrorsMiddleware,
  queryActivitiesQuery
);

routerUtils.get(
  "/activitiesOfMessage",
  authorizeRolesMiddleware("Auditor"),
  inputErrorsMiddleware,
  queryActivitiesMessage
);

// Endpoint que llamará React
routerUtils.get("/reporte",
  inputErrorsMiddleware,
  authorizeRolesMiddleware("Auditor"),
  generateReport
)

export default routerUtils;
