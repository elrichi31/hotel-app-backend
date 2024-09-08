import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Productos extends BaseSchema {
  protected tableName = 'productos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary Key
      table.integer('cantidad').unsigned().notNullable() // Cantidad de productos
      table.string('descripcion', 255).notNullable() // Descripción del producto
      table.decimal('precio_unitario', 10, 2).notNullable() // Precio unitario del producto

      table.integer('factura_id').unsigned().notNullable().references('id').inTable('facturas').onDelete('CASCADE') // Relación con la tabla facturas

      table.timestamp('created_at', { useTz: true }) // Fecha de creación
      table.timestamp('updated_at', { useTz: true }) // Fecha de actualización
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
