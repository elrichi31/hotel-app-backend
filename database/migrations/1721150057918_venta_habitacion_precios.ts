import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class VentaHabitacionPrecio extends BaseSchema {
  protected tableName = 'venta_habitacion_precio'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('venta_id').unsigned().references('id').inTable('ventas').onDelete('CASCADE')
      table.integer('habitacion_id').unsigned().references('id').inTable('habitacion').onDelete('CASCADE')
      table.integer('precio_id').unsigned().references('id').inTable('precios').onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
