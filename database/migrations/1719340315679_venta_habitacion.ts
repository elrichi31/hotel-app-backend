import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'venta_habitacions'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('venta_id').unsigned().references('id').inTable('ventas').onDelete('CASCADE')
      table.integer('habitacion_id').unsigned().references('id').inTable('habitacion').onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['venta_id'])
      table.dropForeign(['habitacion_id'])
    })
    this.schema.dropTable(this.tableName)
  }
}
