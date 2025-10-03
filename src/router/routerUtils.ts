import { Router } from "express";
import { handlerInputErrors } from "../middleware";
import { queryBaseImponibleCatalogo, queryServiceCatalogo } from "../handlers/utilsHandlers";
import { authenticate } from "../middleware/auth";

const routerUtils = Router();

routerUtils.use(authenticate)

routerUtils.get("/service", handlerInputErrors, queryServiceCatalogo);
routerUtils.get("/baseImponible", handlerInputErrors, queryBaseImponibleCatalogo);

export default routerUtils;