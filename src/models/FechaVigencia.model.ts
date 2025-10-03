import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
} from "sequelize-typescript";

@Table({
  tableName: "Fecha_Vigencia",
  timestamps: false,
})

export default class FechaVigencia extends Model {
  // --- LLAVE PRIMARIA ---
  @PrimaryKey // Define esta columna como la llave primaria
  @Column({
    type: DataType.INTEGER, // NUMBER(7,0) se mapea a INTEGER
    field: "NUM_CUENTA",
    allowNull: true, // V en la columna NULO
    comment: "Número de Cuenta",
  })
  declare numCuenta: number;

  // --- COLUMNAS DE LA TABLA ---

  @Column({
    type: DataType.STRING(10), // VARCHAR2(10)
    field: "NUM_FINCA",
    allowNull: false, // Por defecto, si NULO no tiene V
    comment: "Número de Finca",
  })
  declare numFinca: string;

  @Column({
    type: DataType.STRING(8), // VARCHAR2(8)
    field: "NUM_DERECH",
    allowNull: false,
    comment: "Derecho",
  })
  declare numDerech: string;

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2) se mapea a DECIMAL
    field: "AREA_REGIS",
    allowNull: false,
    comment: "Area Registrada",
  })
  declare areaRegis: number;

  @Column({
    type: DataType.INTEGER,
    field: "NUM_PLANO",
    allowNull: false,
    comment: "Número de Plano",
  })
  declare numPlano: number;

  @Column({
    type: DataType.STRING(240), // VARCHAR2(240)
    field: "SENAS_LOTE",
    allowNull: false,
    comment: "Direccion de la Propiedad",
  })
  declare senasLote: string;

  @Column({
    type: DataType.STRING(40), // VARCHAR2(40)
    field: "NUM_DISTRI",
    allowNull: false,
    comment: "Distrito",
  })
  declare numDistri: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "CEDULA",
    allowNull: true, // V en la columna NULO
    comment: "Cédula",
  })
  declare cedula: string;

  @Column({
    type: DataType.INTEGER, // NUMBER(7,0)
    field: "NUM_PERSON",
    allowNull: false,
    comment: "Número de Persona",
  })
  declare numPerson: number;

  @Column({
    type: DataType.STRING(143), // VARCHAR2(143)
    field: "NOM_PERSON",
    allowNull: true, // V en la columna NULO
    comment: "Nombre",
  })
  declare nomPerson: string;

  @Column({
    type: DataType.STRING(30), // VARCHAR2(30)
    field: "SEG_NOMBRE",
    allowNull: false,
    comment: "Segundo Nombre",
  })
  declare segNombre: string;

  @Column({
    type: DataType.STRING(30), // VARCHAR2(30)
    field: "APELLIDOS",
    allowNull: false,
    comment: "Primer Apellido",
  })
  declare apellidos: string;

  @Column({
    type: DataType.STRING(25), // VARCHAR2(25)
    field: "SEG_APELLI",
    allowNull: false,
    comment: "Segundo Apellido",
  })
  declare segApelli: string;

  @Column({
    type: DataType.STRING(25), // VARCHAR2(25)
    field: "CELULAR",
    allowNull: false,
    comment: "Celular",
  })
  declare celular: string;

  @Column({
    type: DataType.STRING(100), // VARCHAR2(100)
    field: "CORREO_ELE",
    allowNull: false,
    comment: "Correo Electronico",
  })
  declare correoEle: string;

  @Column({
    type: DataType.STRING(100), // VARCHAR2(100)
    field: "COR_ELE_AL",
    allowNull: false,
    comment: "Correo Electronico Alterno",
  })
  declare corEleAl: string;

  @Column({
    type: DataType.STRING(500), // VARCHAR2(500)
    field: "DIRECCION1",
    allowNull: false,
    comment: "Direccion 1 Contribuyente",
  })
  declare direccion1: string;

  @Column({
    type: DataType.STRING(500), // VARCHAR2(500)
    field: "DOM_LEGAL",
    allowNull: false,
    comment: "Domicilio Legal",
  })
  declare domLegal: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "TELEFONO1",
    allowNull: false,
    comment: "Telefono 1",
  })
  declare telefono1: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "TELEFONO2",
    allowNull: false,
    comment: "Telefono 2",
  })
  declare telefono2: string;

  @Column({
    type: DataType.STRING(6), // VARCHAR2(6)
    field: "COD_BAS_IM",
    allowNull: true, // V en la columna NULO
    comment: "Código Base Imponible",
  })
  declare codBasIm: string;

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2)
    field: "MON_IMPONI",
    allowNull: true, // V en la columna NULO
    comment: "Monto Base Imponible",
  })
  declare monImponi: number;

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2)
    field: "MON_IMP_IN",
    allowNull: true, // V en la columna NULO
    comment: "Impuesto",
  })
  declare monImpIn: number;

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2)
    field: "MON_FINCA",
    allowNull: false,
    comment: "Valor de Finca",
  })
  declare monFinca: number;

  @Column({
    type: DataType.STRING(240), // VARCHAR2(240)
    field: "NUM_DOCUME",
    allowNull: true, // V en la columna NULO
    comment: "Número Documento",
  })
  declare numDocume: string;

  @Column({
    type: DataType.DATE, // DATE se mapea a DATE
    field: "FEC_VIGENC",
    allowNull: true, // V en la columna NULO
    comment: "Fecha Vigencia",
  })
  declare fecVigenc: Date; // Usamos Date para el tipo DATE

  @Column({
    type: DataType.STRING(240), // VARCHAR2(240)
    field: "ESTADO",
    allowNull: true, // V en la columna NULO
    comment: "Estado",
  })
  declare estado: string;
}