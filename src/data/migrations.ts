// usr/data/migrations.ts
import Usuarios from "../models/User.model"; // ajusta la ruta según tu estructura
import bcrypt from "bcrypt";

/**
 * Ejecuta la migración inicial: crea un usuario administrador
 * si no existe un registro con ese correo.
 */
export async function runInitialMigration() {
  try {
    // Buscar si ya existe un usuario administrador por correo
    const adminEmail = "j.pablo.sorto@gmail.com";
    const adminExists = await Usuarios.findOne({ where: { Correo: adminEmail } });

    if (!adminExists) {
      console.log("No existe el usuario administrador. Creándolo...");

      const hashedPassword = await bcrypt.hash("12345678", 10);

      await Usuarios.create({
        Nombre: "Pablo",
        Rol: "Administrador",
        Correo: adminEmail,
        Clave: hashedPassword,
        Activo: true,
        Eliminado: false,
      });

      console.log("Usuario administrador creado correctamente.");
    } else {
      console.log("El usuario administrador ya existe. No se realizó ninguna acción.");
    }
  } catch (error) {
    console.error("Error durante la migración inicial:", error);
  }
}
