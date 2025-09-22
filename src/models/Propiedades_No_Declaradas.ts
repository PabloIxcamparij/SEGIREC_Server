import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Index,
} from "sequelize-typescript";

@Table({
  tableName: "Propiedades_No_Declaradas",
})
class PropiedadesNoDeclaradas extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    field: "NUM_CUENTA",
    allowNull: true,
    comment: "Número de Cuenta",
  })
  declare numCuenta: number;

  @Column({
    type: DataType.STRING(10),
    field: "NUM_FINCA",
    comment: "Número de Finca",
  })
  declare numFinca: string;

  @Column({
    type: DataType.STRING(8),
    field: "NUM_DERECH",
    comment: "Derechos",
  })
  declare numDerech: string;

  @Column({
    type: DataType.DECIMAL(16, 2),
    field: "AREA_REGIS",
    comment: "Area Registrada",
  })
  declare areaRegis: number;

  @Column({
    type: DataType.STRING(40),
    field: "NOM_DISTRI",
    comment: "Distrito",
  })
  declare nomDistri: string;

  @Column({
    type: DataType.STRING(20),
    field: "CEDULA",
    allowNull: false,
    comment: "Cédula",
  })
  declare cedula: string;

  @Column({
    type: DataType.INTEGER,
    field: "NUM_PERSON",
    allowNull: false,
    comment: "Número de Persona",
  })
  declare numPerson: number;

  @Column({
    type: DataType.STRING(143),
    field: "NOM_PERSON",
    allowNull: false,
    comment: "Nombre",
  })
  declare nomPerson: string;

  @Column({
    type: DataType.STRING(30),
    field: "SEG_NOMBRE",
    comment: "Segundo Nombre",
  })
  declare segNombre: string;

  @Column({
    type: DataType.STRING(30),
    field: "APELLIDOS",
    comment: "Primer Apellido",
  })
  declare apellidos: string;

  @Column({
    type: DataType.STRING(25),
    field: "SEG_APELLI",
    comment: "Segundo Apellido",
  })
  declare segApelli: string;

  @Column({
    type: DataType.STRING(20),
    field: "CELULAR",
    comment: "Celular",
  })
  declare celular: string;

  @Column({
    type: DataType.STRING(100),
    field: "CORREO_ELE",
    comment: "Correo Electronico",
  })
  declare correoEle: string;

  @Column({
    type: DataType.STRING(100),
    field: "COR_ELE_AL",
    comment: "Correo Electronico Alterno",
  })
  declare corEleAl: string;

  @Column({
    type: DataType.STRING(500),
    field: "DIRECCION1",
    comment: "Direccion 1 Contribuyente",
  })
  declare direccion1: string;

  @Column({
    type: DataType.STRING(500),
    field: "DOM_LEGAL",
    comment: "Domicilio Legal",
  })
  declare domLegal: string;

  @Column({
    type: DataType.STRING(20),
    field: "TELEFONO1",
    comment: "Telefono 1",
  })
  declare telefono1: string;

  @Column({
    type: DataType.STRING(20),
    field: "TELEFONO2",
    comment: "Telefono 2",
  })
  declare telefono2: string;
}

export default PropiedadesNoDeclaradas;