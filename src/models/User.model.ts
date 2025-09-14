import {
  Table,
  Model,
  Column,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import bcrypt from "bcrypt";

@Table({
  tableName: "usuarios",
})
class Usuarios extends Model {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  declare Nombre: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare Correo: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare Rol: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare Clave: string;

  // Hook antes de crear
  @BeforeCreate
  static async hashPasswordBeforeCreate(instance: Usuarios) {
    instance.Clave = await bcrypt.hash(instance.Clave, 10);
  }

  // Hook antes de actualizar
  @BeforeUpdate
  static async hashPasswordBeforeUpdate(instance: Usuarios) {
    if (instance.changed("Clave")) {
      instance.Clave = await bcrypt.hash(instance.Clave, 10);
    }
  }

  // Método para comparar contraseñas en login
  async validatePassword(Clave: string): Promise<boolean> {
    return bcrypt.compare(Clave, this.Clave);
  }
}

export default Usuarios;
