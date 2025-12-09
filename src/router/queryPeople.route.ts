import { Router } from "express";
import { activitiMiddleware } from "../middleware/activitiMiddleware";
import { inputErrorsMiddleware } from "../middleware/inputErrorsMiddleware";
import { authenticateMiddleware } from "../middleware/authenticateMiddleware";
import { authorizeRolesMiddleware } from "../middleware/authorizeRolesMiddleware";
import { queryPeopleWithDebt, queryPeopleWithProperties } from "../controller/queryPeople.controller";

const queryPeople = Router();

// Middleware de autenticación para proteger las rutas

queryPeople.use(authenticateMiddleware);

// Rutas para la consulta de propiedades y personas

queryPeople.post(
  "/queryPeopleWithProperties",
  authorizeRolesMiddleware("Propiedades"),
  inputErrorsMiddleware,
  activitiMiddleware("Consulta", "De la tabla Propiedades"),
  queryPeopleWithProperties
);

queryPeople.post(
  "/queryPeopleWithDebt",
  authorizeRolesMiddleware("Morosidad"),
  inputErrorsMiddleware,
  activitiMiddleware("Consulta", "De la tabla Morosidad"),
  queryPeopleWithDebt
);

export default queryPeople;
