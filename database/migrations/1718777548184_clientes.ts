import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable()
      table.string('apellido', 100).notNullable()
      table.string('email', 100)
      table.string('telefono', 15)
      table.string('direccion', 255)
      table.integer('identificacion').notNullable().unique()
      table.timestamp('fecha_registro', { useTz: true }).defaultTo(this.now()) 

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
