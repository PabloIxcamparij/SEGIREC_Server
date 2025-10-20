import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({
  tableName: "Control_Actividades",
})
export default class ControlActividades extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(10),
    field: "IdUsuario",
    allowNull: false,
  })
  declare IdUsuario: string;

  @Column({
    type: DataType.STRING(200),
    field: "Tipo",
    allowNull: false,
  })
  declare Tipo: string;

  @Column({
    type: DataType.STRING(200),
    field: "Detalle",
    allowNull: false,
  })
  declare Detalle: string;

  @Column({
    type: DataType.STRING(200),
    field: "Estado",
    allowNull: false,
  })
  declare Estado: string;

  @Column({
    type: DataType.STRING(200),
    field: "NumeroDeCorreos",
  })
  declare NumeroDeCorreos: string;
}
