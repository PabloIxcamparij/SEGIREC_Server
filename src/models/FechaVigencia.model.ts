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
    allowNull: false, // NO NULO
    comment: "Número de Cuenta",
  })
  declare numCuenta: number;

  // --- COLUMNAS DE LA TABLA ---

  @Column({
    type: DataType.STRING(10), // VARCHAR2(10)
    field: "NUM_FINCA",
    allowNull: false, // NO NULO
    comment: "Número de Finca",
  })
  declare numFinca: string;

  @Column({
    type: DataType.STRING(8), // VARCHAR2(8)
    field: "NUM_DERECH",
    allowNull: false, // NO NULO
    comment: "Derecho",
  })
  declare numDerech: string;

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2) se mapea a DECIMAL o FLOAT
    field: "AREA_REGIS",
    allowNull: false, // NO NULO
    comment: "Area Registrada",
  })
  declare areaRegis: number;

  @Column({
    type: DataType.INTEGER, // NUMBER(7,0) se mapea a INTEGER
    field: "NUM_PLANO",
    allowNull: false, // NO NULO
    comment: "Número de Plano",
  })
  declare numPlano: number;

  @Column({
    type: DataType.STRING(240), // VARCHAR2(240)
    field: "SENAS_LOTE",
    allowNull: false, // NO NULO
    comment: "Direccion de la Propiedad",
  })
  declare senasLote: string;

  @Column({
    type: DataType.STRING(40), // VARCHAR2(40)
    field: "NOM_DISTRI",
    allowNull: false, // NO NULO
    comment: "Distrito",
  })
  declare nomDistri: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "CEDULA",
    allowNull: true, // NULO V
    comment: "Cédula",
  })
  declare cedula: string | null; // Puede ser null

  @Column({
    type: DataType.INTEGER, // NUMBER(7,0)
    field: "NUM_PERSON",
    allowNull: false, // NO NULO
    comment: "Número de Persona",
  })
  declare numPerson: number;

  @Column({
    type: DataType.STRING(143), // VARCHAR2(143)
    field: "NOM_PERSON",
    allowNull: true, // NULO V
    comment: "Nombre",
  })
  declare nomPerson: string | null; // Puede ser null

  @Column({
    type: DataType.STRING(30), // VARCHAR2(30)
    field: "SEG_NOMBRE",
    allowNull: false, // NO NULO
    comment: "Segundo Nombre",
  })
  declare segNombre: string;

  @Column({
    type: DataType.STRING(30), // VARCHAR2(30)
    field: "APELLIDOS",
    allowNull: false, // NO NULO
    comment: "Primer Apellido",
  })
  declare apellidos: string;

  @Column({
    type: DataType.STRING(25), // VARCHAR2(25)
    field: "SEG_APELLI",
    allowNull: false, // NO NULO
    comment: "Segundo Apellido",
  })
  declare segApelli: string;

  @Column({
    type: DataType.STRING(25), // VARCHAR2(25)
    field: "CELULAR",
    allowNull: false, // NO NULO
    comment: "Celular",
  })
  declare celular: string;

  @Column({
    type: DataType.STRING(100), // VARCHAR2(100)
    field: "CORREO_ELE",
    allowNull: false, // NO NULO
    comment: "Correo Electronico",
  })
  declare correoEle: string;

  @Column({
    type: DataType.STRING(100), // VARCHAR2(100)
    field: "COR_ELE_AL",
    allowNull: false, // NO NULO
    comment: "Correo Electronico Alterno",
  })
  declare corEleAl: string;

  @Column({
    type: DataType.STRING(500), // VARCHAR2(500)
    field: "DIRECCION1",
    allowNull: false, // NO NULO
    comment: "Direccion 1 Contribuyente",
  })
  declare direccion1: string;

  @Column({
    type: DataType.STRING(500), // VARCHAR2(500)
    field: "DOM_LEGAL",
    allowNull: false, // NO NULO
    comment: "Domicilio Legal",
  })
  declare domLegal: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "TELEFONO1",
    allowNull: false, // NO NULO
    comment: "Telefono 1",
  })
  declare telefono1: string;

  @Column({
    type: DataType.STRING(20), // VARCHAR2(20)
    field: "TELEFONO2",
    allowNull: false, // NO NULO
    comment: "Telefono 2",
  })
  declare telefono2: string;

  @Column({
    type: DataType.STRING(6), // VARCHAR2(6)
    field: "COD_BAS_IM",
    allowNull: true, // NULO V
    comment: "Código Base Imponible",
  })
  declare codBasIm: string | null; // Puede ser null

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2)
    field: "MON_IMPONI",
    allowNull: true, // NULO V
    comment: "Monto Base Imponible",
  })
  declare monImponi: number | null; // Puede ser null

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2)
    field: "MON_IMP_IN",
    allowNull: true, // NULO V
    comment: "Impuesto",
  })
  declare monImpIn: number | null; // Puede ser null

  @Column({
    type: DataType.DECIMAL(16, 2), // NUMBER(16,2)
    field: "MON_FINCA",
    allowNull: false, // NO NULO
    comment: "Valor de Finca",
  })
  declare monFinca: number;

  @Column({
    type: DataType.STRING(240), // VARCHAR2(240)
    field: "NUM_DOCUME",
    allowNull: true, // NULO V
    comment: "Número Documento",
  })
  declare numDocume: string | null; // Puede ser null

  @Column({
    type: DataType.DATE, // DATE se mapea a DATE
    field: "FEC_VIGENC",
    allowNull: true, // NULO V
    comment: "Fecha Vigencia",
  })
  declare fecVigenc: Date | null; // Puede ser null

  @Column({
    type: DataType.STRING(240), // VARCHAR2(240)
    field: "ESTADO",
    allowNull: true, // NULO V
    comment: "Estado",
  })
  declare estado: string | null; // Puede ser null
}