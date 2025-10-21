// usr/data/migrations.ts
import Usuarios from "../models/User.model"; // ajusta la ruta según tu estructura
import bcrypt from "bcrypt";

/**
 * Ejecuta la migración inicial: crea un usuario administrador si no hay registros.
 */
export async function runInitialMigration() {
  try {
    const count = await Usuarios.count();

    if (count === 0) {
      console.log("No hay usuarios en la tabla. Creando usuario administrador...");

      const hashedPassword = await bcrypt.hash("12345678", 10);
      
      await Usuarios.create({
        Nombre: "Pablo",
        Rol: "Administrador",
        Correo: "j.pablo.sorto@gmail.com",
        Clave: hashedPassword,
        Activo: true,
        Eliminado: false,
      });

      console.log("Usuario administrador creado correctamente.");
    } else {
      console.log("Ya existen usuarios en la base de datos. No se creó ninguno nuevo.");
    }
  } catch (error) {
    console.error("Error durante la migración inicial:", error);
  }
}
