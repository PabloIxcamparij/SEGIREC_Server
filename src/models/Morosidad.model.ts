import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
} from "sequelize-typescript";

@Table({
  tableName: "MOROSIDAD",
  timestamps: false,
})

export class Morosidad extends Model {
  // --- LLAVE PRIMARIA ---
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING(30), // VARCHAR2(30)
    field: "AUX_CONTAB",
    allowNull: true, // V en NULO
    comment: "Auxiliar Contable",
  })
  declare auxContab: string;

  @Column({
    type: DataType.INTEGER, // NUMBER(7,0)
    field: "NUM_CUENTA",
    allowNull: true, // V en NULO (aunque es llave primaria, se respeta la tabla fuente)
    comment: "Número de Cuenta",
  })
  declare numCuenta: number;

  @Column({
    type: DataType.STRING(3), // VARCHAR2(3)
    field: "TIP_TRANSA",
    allowNull: true, // V en NULO
    comment: "Tipo de Transacción",
  })
  declare tipTransa: string;

  @Column({
    type: DataType.INTEGER, // NUMBER(7,0)
    field: "NUM_PERSON",
    allowNull: true, // V en NULO
    comment: "Número de Persona",
  })
  declare numPerson: number;

  @Column({
    type: DataType.DATE, // DATE
    field: "FEC_VENCIM",
    allowNull: true, // V en NULO
    comment: "Fecha Vencimiento",
  })
  declare fecVencim: Date;

  @Column({
    type: DataType.DECIMAL, // NUMBER() - Usamos DECIMAL por defecto para dinero
    field: "MON_DEUDA",
    allowNull: false, // VACÍO en NULO
    comment: "Monto Deuda",
  })
  declare monDeuda: number;

  @Column({
    type: DataType.INTEGER, // NUMBER(7,0)
    field: "DIA_VENCIMI",
    allowNull: false, // VACÍO en NULO
    comment: "Dias Atrasados",
  })
  declare diaVencimi: number;

  @Column({
    type: DataType.DECIMAL(6, 2), // NUMBER(6,2)
    field: "PERIODO",
    allowNull: false, // VACÍO en NULO
    comment: "Periodo",
  })
  declare periodo: number;

  @Column({
    type: DataType.STRING(50), // VARCHAR2(50)
    field: "CEDULA",
    allowNull: true, // V en NULO
    comment: "Cédula",
  })
  declare cedula: string;

  @Column({
    type: DataType.STRING(226), // VARCHAR2(226)
    field: "NOM_COMPLE",
    allowNull: false, // VACÍO en NULO
    comment: "Nombre Completo",
  })
  declare nomComple: string;

  @Column({
    type: DataType.STRING(50), // VARCHAR2(50)
    field: "DES_SERVIC",
    allowNull: false, // VACÍO en NULO
    comment: "Servicio",
  })
  declare desServic: string;

  @Column({
    type: DataType.STRING(10), // VARCHAR2(10)
    field: "NUM_FINCA",
    allowNull: false, // VACÍO en NULO
    comment: "Número de Finca",
  })
  declare numFinca: string;

  @Column({
    type: DataType.STRING(8), // VARCHAR2(8)
    field: "NUM_DERECH",
    allowNull: false, // VACÍO en NULO
    comment: "Número de Derecho",
  })
  declare numDerech: string;

  @Column({
    type: DataType.STRING(40), // VARCHAR2(40)
    field: "NOM_DISTRI",
    allowNull: false, // VACÍO en NULO
    comment: "Distrito",
  })
  declare nomDistri: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "TELEFONO1",
    allowNull: false, // VACÍO en NULO
    comment: "Telefono 1",
  })
  declare telefono1: string;

  @Column({
    type: DataType.STRING(100), // VARCHAR2(100)
    field: "CORREO_ELE",
    allowNull: false, // VACÍO en NULO
    comment: "Correo Electronico",
  })
  declare correoEle: string;

  @Column({
    type: DataType.STRING(500), // VARCHAR2(500)
    field: "DIRECCION1",
    allowNull: false, // VACÍO en NULO
    comment: "Dirección",
  })
  declare direccion1: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "CELULAR",
    allowNull: false, // VACÍO en NULO
    comment: "Celular",
  })
  declare celular: string;
}

export default Morosidad;