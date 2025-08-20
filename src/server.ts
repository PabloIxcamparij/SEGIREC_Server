import express from "express";
import colors from "colors";
import productsRouter from "./router";
import db from "./config/db";

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
    console.log("Origin:", origin); // ver qué envía realmente
    if (!origin || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

server.use(cors(corsOptions));

// Leer datos de formulario, habilita la lectura
server.use(express.json());

server.use(morgan("dev"));

// http://localhost:4000/api/

server.use("/api", productsRouter);

// Docs
server.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));

export default server;
