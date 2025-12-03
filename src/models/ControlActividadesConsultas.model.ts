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
   TABLA HIJA 1: ConsultaTablas
   - Solo se crea si tipo === "Consulta"
   ============================================================ */
@Table({ tableName: "Control_Consultas_Tabla" })
export default class ConsultasTabla extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => ControlActividades)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdActividad: number;

  @BelongsTo(() => ControlActividades)
  declare Actividad: ControlActividades;

  @Column({ type: DataType.JSON, allowNull: true })
  declare FiltrosAplicados: any;  
}