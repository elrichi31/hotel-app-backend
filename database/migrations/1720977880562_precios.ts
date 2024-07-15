import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PreciosSchema extends BaseSchema {
  protected tableName = 'precios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('habitacion_id').unsigned().references('id').inTable('habitacion').onDelete('CASCADE')
      table.integer('numero_personas').notNullable()
      table.decimal('precio', 10, 2).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
