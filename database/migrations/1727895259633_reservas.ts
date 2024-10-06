import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Reservas extends BaseSchema {
  protected tableName = 'reservas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre').notNullable()
      table.string('apellido').notNullable()
      table.date('fecha_inicio').notNullable()
      table.date('fecha_fin').notNullable()
      table.integer('numero_personas').notNullable()
      table.enum('estado', ['pendiente', 'confirmado', 'cancelada']).defaultTo('pendiente')
      table.decimal('total', 12, 2).notNullable()
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}