// =========================
// IMPORTACIÓN DE MÓDULOS
// =========================

// ---- Rutas ----
import routerAuth from "./router/auth.route";
import routerAdmin from "./router/admin.route";
import routerUtils from "./router/utils.route";
import sendMessage from "./router/sendMessage.route";
import queryPeople from "./router/queryPeople.route";

// ---- Configuración base de datos ----
import db from "./config/dataBase.config";
import { runInitialMigration } from "./data/migrations";

// ---- Documentación (Swagger) ----
import SwaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config";

// ---- Seguridad y utilidades ----
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// ---- Librerías externas ----
import colors from "colors";
import express from "express";

// ============================================
// CONEXIÓN A LA BASE DE DATOS (Sequelize)
// ============================================
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

// ============================================
// INSTANCIA DE SERVIDOR EXPRESS
// ============================================

const server = express();

// Configuracion de seguridad
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
server.use("/auth", routerAuth);
server.use("/admin", routerAdmin);
server.use("/utils", routerUtils);
server.use("/message", sendMessage);
server.use("/queryPeople", queryPeople);

// Docs
server.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));

export default server;
