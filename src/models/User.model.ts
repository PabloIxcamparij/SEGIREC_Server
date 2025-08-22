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
  tableName: "users",
})
class User extends Model {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare correo: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  // Hook antes de crear
  @BeforeCreate
  static async hashPasswordBeforeCreate(instance: User) {
    instance.password = await bcrypt.hash(instance.password, 10);
  }

  // Hook antes de actualizar
  @BeforeUpdate
  static async hashPasswordBeforeUpdate(instance: User) {
    if (instance.changed("password")) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }

  // Método para comparar contraseñas en login
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

export default User;
