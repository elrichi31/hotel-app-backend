import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateConfiguracion extends BaseSchema {
  protected tableName = 'configuracion'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre_hotel', 150).notNullable().defaultTo('HotelApp')
      table.string('logo_path', 255).nullable()
      table.decimal('porcentaje_iva', 5, 2).notNullable().defaultTo(15)
      table.string('direccion', 255).nullable()
      table.string('telefono', 30).nullable()
      table.string('correo', 255).nullable()
      table.timestamps(true)
    })

    // Fila única (id=1): el resto de la app asume que siempre existe.
    this.schema.raw(
      "INSERT INTO configuracion (id, nombre_hotel, porcentaje_iva, created_at, updated_at) VALUES (1, 'HotelApp', 15, NOW(), NOW())"
    )
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
