import { exit } from "node:process";
import db from "../config/db";

const clearDB = async () => {
    try {
        await db.sync({ force: true });
        console.log("Database cleared successfully");
        await db.close(); // Cierra la conexión a la base de datos
        exit();
    } catch (error) {
        console.log("Failed to clear the database");
        console.error(error);
        await db.close(); // Cierra la conexión en caso de error
        exit(1);
    }
};

if (process.argv[2] === '---clear') {
    clearDB();
}
