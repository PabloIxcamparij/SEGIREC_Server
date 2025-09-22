import express from "express";
import colors from "colors";
import routerSendMessage from "./router/routerSendMessage";
import routerAuth from "./router/routerAuth"
import db from "./config/db";
import cookieParser from "cookie-parser";


// Swagger import
import SwaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

// Cors import (Seguridad)
import cors, { CorsOptions } from "cors";

// Morgan
import morgan from "morgan";

// Conexion a la base de datos
async function ConnectDB() {
  try {
    await db.authenticate();
    await db.sync();
    console.log(colors.bgGreen.white("Conexion exitosa con la bd"));
  } catch (error) {
    console.log(colors.bgRed.white("Hubo un error en la conexion con la bd"));
    console.log(error);
  }
}

ConnectDB();

// Instacia de Axios de express
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
server.use("/auth", routerAuth)

// Docs
server.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));

export default server;
