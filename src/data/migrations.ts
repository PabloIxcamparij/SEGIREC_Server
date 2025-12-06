// usr/data/migrations.ts
import Usuarios from "../models/User.model"; // ajusta la ruta según tu estructura

/**
 * Ejecuta la migración inicial: crea un usuario administrador
 * si no existe un registro con ese correo.
 */
export async function runInitialMigration() {
  try {
    // Buscar si ya existe un usuario administrador por correo
    const adminEmail = "roylopezs@bagaces.go.cr";
    const adminExists = await Usuarios.findOne({ where: { Correo: adminEmail } });

    if (!adminExists) {
      console.log("No existe el usuario administrador. Creándolo...");

      await Usuarios.create({
        Nombre: "Roy",
        Rol: "Administrador",
        Correo: adminEmail,
        Clave: "12345678",
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
