// src/config/db.ts
import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

// Verifica que la URL esté definida
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en el archivo .env");
}

// Crea la conexión a la base de datos
const db = new Sequelize(process.env.DATABASE_URL, {
  models: [__dirname + "/../models/**/*"],
  logging: false, // cambia a true si quieres ver las consultas SQL
});

export default db;
