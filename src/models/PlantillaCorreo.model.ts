// src/models/PlantillaCorreo.model.ts

import {
  Table,
  Model,
  Column,
  DataType,
  PrimaryKey,
} from "sequelize-typescript";

@Table({
  tableName: "Plantillas_Correo", // Nombre de tabla general
})
export default class PlantillaCorreo extends Model {
  @PrimaryKey
  @Column(DataType.STRING(50))
  declare clave: string; // Clave única: 'MOROSIDAD', 'PROPIEDAD', 'LOGIN_EXITOSO'

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare asunto: string | null; // Asunto del correo (opcional)

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  declare cuerpo_html: string; // El cuerpo de la plantilla (Handlebars/EJS)

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare notas_o_pie: string | null; // El pie de página con notas legales e info de pago
}