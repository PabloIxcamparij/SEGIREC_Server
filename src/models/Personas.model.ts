import { Table, Model, Column, DataType, Default } from "sequelize-typescript";

@Table({
  tableName: "personas",
})
class Persona extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true, // El correo debe ser único para cada persona
  })
  declare correo: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare telefono: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare estadoDeMoratorio: boolean;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare ciudad: string;

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

export default Persona;