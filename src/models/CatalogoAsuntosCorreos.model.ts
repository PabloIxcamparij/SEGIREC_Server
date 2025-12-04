import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({
  tableName: "Catalogo_AsuntosCorreos",
  timestamps: false,
})
export default class CatalogoAsuntosCorreos extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    field: "Asunto",
  })
  declare asunto: string;
}