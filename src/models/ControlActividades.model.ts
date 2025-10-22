import {
  Table,
  Model,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  PrimaryKey,
  AutoIncrement,
  HasMany,
} from "sequelize-typescript";
import Usuarios from "./User.model";
import ConsultasTabla from "./ControlActividadesConsultas.model";
import EnvioMensajes from "./ControlActividadesEnvioMensajes.model";

/* ============================================================
   MODELO PRINCIPAL: ControlActividades
   - Representa una acción o proceso ejecutado por un usuario.
   - Siempre se crea un registro padre.
   ============================================================ */
@Table({ tableName: "Control_Actividades" })
export default class ControlActividades extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Usuarios)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare IdUsuario: number;

  @BelongsTo(() => Usuarios)
  declare Usuario: Usuarios;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare Tipo: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare Detalle: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare Estado: string;

  // Relaciones a las hijas
  @HasMany(() => ConsultasTabla)
  declare Filtros: ConsultasTabla[];

  @HasMany(() => EnvioMensajes)
  declare Envios: EnvioMensajes[];
}
