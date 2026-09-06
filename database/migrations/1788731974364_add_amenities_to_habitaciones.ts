import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddAmenitiesToHabitaciones extends BaseSchema {
  protected tableName = 'habitacion'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('capacidad').notNullable().defaultTo(2)
      table.boolean('wifi').notNullable().defaultTo(false)
      table.string('tipo_cama', 20).notNullable().defaultTo('Doble')
      table.boolean('tv_cable').notNullable().defaultTo(false)
      table.json('amenidades').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('capacidad')
      table.dropColumn('wifi')
      table.dropColumn('tipo_cama')
      table.dropColumn('tv_cable')
      table.dropColumn('amenidades')
    })
  }
}
