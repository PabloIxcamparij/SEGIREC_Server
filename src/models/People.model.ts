import { Table, Model, Column, DataType, Default } from "sequelize-typescript";

@Table({
  tableName: "people",
})
class People extends Model {
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true, 
  })
  declare cedula: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare nombre: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare apellido: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare correo: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare telefono: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare distrito: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare servicio: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  declare valorDeLaDeuda: number;
}

export default People;