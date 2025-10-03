import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({
  tableName: "Catalogo_Servicios",
  timestamps: false,
})

export default class CatalogoService extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(10),
    field: "AUX_CONTAB",
  })
  declare auxContab: string;

  @Column({
    type: DataType.STRING(10),
    field: "COD_SERVIC",
  })
  declare codServic: string;

  @Column({
    type: DataType.STRING(200),
    field: "DES_SERVIC",
  })
  declare desServic: string;
}