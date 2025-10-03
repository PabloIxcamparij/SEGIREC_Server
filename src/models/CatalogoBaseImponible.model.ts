import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";


@Table({
  tableName: "Catalogo_BaseImponible",
  timestamps: false,
})
export default class CatalogoBaseImponible extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(10),
    field: "Codigo",
  })
  declare codigo: string;

  @Column({
    type: DataType.STRING(200),
    field: "Descripción",
  })
  declare descripcion: string;
}