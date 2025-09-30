import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

/**
 * @typedef Deuda
 * Representa el modelo de datos para las deudas o registros de cuenta,
 * basado en la estructura de la tabla proporcionada.
 */

@Table({
  tableName: "Catalogo_Servicios",
  timestamps: false,
})
class ServiceCatalogo extends Model {
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

export default ServiceCatalogo;
