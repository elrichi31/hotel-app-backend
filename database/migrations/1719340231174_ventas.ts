import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'ventas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('id_cliente').unsigned().references('id').inTable('clientes').notNullable()
      table.string('nombre', 100).notNullable()
      table.string('apellido', 100).notNullable()
      table.string('cedula', 20).notNullable()
      table.string('direccion', 255).notNullable()
      table.string('telefono', 15).notNullable()
      table.decimal('total', 10, 2).notNullable()
      table.integer('numero_personas').notNullable()
      table.string('metodo_pago', 50).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
