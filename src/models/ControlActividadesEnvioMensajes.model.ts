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
import ControlActividades from "./ControlActividades.model";

/* ============================================================
   TABLA HIJA 2: EnvioMensajes
   - Solo se crea si tipo === "EnvioMensajes"
   ============================================================ */
@Table({ tableName: "Control_Envio_Mensajes" })
export default  class EnvioMensajes extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ControlActividades)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdActividad: number;

  @BelongsTo(() => ControlActividades)
  declare Actividad: ControlActividades;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare NumeroDeMensajes: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare NumeroDeCorreosEnviadosCorrectamente: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare NumeroDeWhatsAppEnviadosCorrectamente: number;
}