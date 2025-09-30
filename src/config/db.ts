import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

// Elige la URL de la base de datos basándose en el entorno
const dbUrl =
  process.env.NODE_ENV === "production"
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_DEV;

if (!dbUrl) {
  throw new Error(
    "La URL de la base de datos no está definida. Por favor, revisa tus variables de entorno."
  );
}

const db = new Sequelize(dbUrl, {
  models: [__dirname + "/../models/**/*"],
  logging: false,
});

export default db;