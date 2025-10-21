// Rutas import
import routerSendMessage from "./router/routerSendMessage";
import routerUtils from "./router/routerUtils";
import routerAuth from "./router/routerAuth"
import db from "./config/db";

// Swagger import
import SwaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

// Cors import (Seguridad)
import cors, { CorsOptions } from "cors";

// Extermal libraries
import colors from "colors";
import morgan from "morgan";
import express from "express";
import cookieParser from "cookie-parser";
import { runInitialMigration } from "./data/migrations";

// Conexion a la base de datos
async function ConnectDB() {
  try {
    await db.authenticate();
    await db.sync();
    console.log(colors.bgGreen.white("Conexion exitosa con la bd"));

    await runInitialMigration();
    
  } catch (error) {
    console.log(colors.bgRed.white("Hubo un error en la conexion con la bd"));
    console.log(error);
  }
}

ConnectDB();

// Instancia de Axios de express
const server = express();

// Permitir conexiones con Cors
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    console.log("Origin recibido:", origin);
    if (!origin || process.env.FRONTEND_URL.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Bloqueado por CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

server.use(cors(corsOptions));
server.use(cookieParser());

// Leer datos de formulario, habilita la lectura
server.use(express.json());

server.use(morgan("dev"));

//Cargar Rutas
server.use("/message", routerSendMessage);
server.use("/auth", routerAuth);
server.use("/utils", routerUtils);

// Docs
server.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));

export default server;
