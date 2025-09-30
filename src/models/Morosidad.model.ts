import {
  Table,
  Model,
  Column,
  DataType,
} from "sequelize-typescript";

/**
 * @typedef Deuda
 * Representa el modelo de datos para las deudas o registros de cuenta,
 * basado en la estructura de la tabla proporcionada.
 */
@Table({
  tableName: "MOROSIDAD",
  timestamps: false, 
})
class Morosidad extends Model {

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: "Auxiliar Contable",
  })
  declare AUX_CONTAB: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: "Número de Cuenta",
  })
  declare NUM_CUENTA: number;

  @Column({
    type: DataType.STRING(3),
    allowNull: false,
    comment: "Tipo de Transacción",
  })
  declare TIP_TRANSA: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false, 
    comment: "Número de Persona",
  })
  declare NUM_PERSON: number;

  @Column({
    type: DataType.DATEONLY, 
    allowNull: false,
    comment: "Fecha Vencimiento",
  })
  declare FEC_VENCIM: Date;

  @Column({
    type: DataType.DECIMAL,
    allowNull: true, 
    comment: "Monto Deuda",
  })
  declare MON_DEUDA: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    comment: "Cédula",
  })
  declare CEDULA: string;

  @Column({
    type: DataType.STRING(226),
    allowNull: true,
    comment: "Nombre Completo",
  })
  declare NOM_COMPLE: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    comment: "Servicio",
  })
  declare DES_SERVIC: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    comment: "Número de Finca",
  })
  declare NUM_FINCA: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
    comment: "Distrito",
  })
  declare NOM_DISTRI: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: "Telefono 1",
  })
  declare TELEFONO1: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: "Telefono 2",
  })
  declare TELEFONO2: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: "Correo Electronico",
  })
  declare CORREO_ELE: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: "Celular",
  })
  declare CELULAR: string;

  @Column({
    type: DataType.STRING(1),
    allowNull: true,
    comment: "Arreglo de Pago",
  })
  declare IND_ARR_PG: string;
}

export default Morosidad;