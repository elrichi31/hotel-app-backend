import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'habitacion'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('numero', 10).notNullable().unique()
      table.string('tipo', 50).notNullable()
      table.decimal('precio', 10, 2).notNullable()
      table.string('estado', 20).defaultTo('disponible')
      table.text('descripcion')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
