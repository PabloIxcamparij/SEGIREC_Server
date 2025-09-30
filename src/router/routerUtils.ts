import { Router } from "express";
import { body } from "express-validator";
import { handlerInputErrors } from "../middleware";
import { queryServiceCatalogo } from "../handlers/utilsHandlers";
import { authenticate } from "../middleware/auth";

const routerUtils = Router();

routerUtils.use(authenticate)

routerUtils.get("/service", handlerInputErrors, queryServiceCatalogo);

export default routerUtils;
