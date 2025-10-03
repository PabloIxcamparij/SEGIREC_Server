import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

// Determina el entorno y la URL de la base de datos
const isProduction = process.env.NODE_ENV === "production";
const dbUrl = isProduction
    ? process.env.DATABASE_URL_PROD
    : process.env.DATABASE_URL_DEV;

if (!dbUrl) {
    throw new Error(
        "La URL de la base de datos no está definida. Por favor, revisa tus variables de entorno."
    );
}

// **Lógica de corrección de SSL/TLS**
// 1. Necesitas SSL si estás en producción, o si la URL de desarrollo apunta a un proveedor remoto como Render.
//    (Tu URL de desarrollo actual es la de Render).
const needsSsl = isProduction || dbUrl.includes("render.com");

const sslOptions = needsSsl ? {
    // Estas opciones se pasan al constructor de Sequelize y se fusionan con la configuración principal.
    dialectOptions: {
        ssl: {
            // Requerir SSL
            require: true,
            // Importante: deshabilita la verificación de certificado para evitar errores con certificados autofirmados (común en Render)
            rejectUnauthorized: false,
        },
    }
} : {}; // Si no se necesita SSL, es un objeto vacío.


const db = new Sequelize(dbUrl, {
    models: [__dirname + "/../models/**/*"],
    logging: false,
    
    // 2. **Aplica las opciones de conexión específicas del dialecto (PostgreSQL)**
    // El operador spread (...) fusiona las propiedades de 'sslOptions' (si existen) con la configuración de Sequelize.
    ...sslOptions,
});

export default db;