import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";
import Usuarios from "./User.model";

@Table({
  tableName: "Control_Actividades",
})
export default class ControlActividades extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Usuarios)
  @Column({
    type: DataType.INTEGER,
    field: "IdUsuario",
    allowNull: false,
  })
  declare IdUsuario: number;

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
    type: DataType.STRING(100),
    field: "Estado",
    allowNull: false,
  })
  declare Estado: string;

  @Column({
    type: DataType.STRING(300),
    field: "FiltrosAplicados",
  })
  declare FiltrosAplicados: string;

  @Column({
    type: DataType.INTEGER,
    field: "NumeroDeMensajes",
  })
  declare NumeroDeMensajes: number;

  @Column({
    type: DataType.INTEGER,
    field: "NumeroDeCorreosEnviadosCorrectamente",
  })
  declare NumeroDeCorreosEnviadosCorrectamente: number;

  @Column({
    type: DataType.INTEGER,
    field: "NumeroDeWhatsAppEnviadosCorrectamente",
  })
  declare NumeroDeWhatsAppEnviadosCorrectamente: number;
}
