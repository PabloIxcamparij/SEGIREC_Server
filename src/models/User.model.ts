import {
  Table,
  Model,
  Column,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";

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

}

export default User;
