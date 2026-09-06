import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddMoreAmenitiesToHabitaciones extends BaseSchema {
  protected tableName = 'habitacion'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('mesa_trabajo').notNullable().defaultTo(false)
      table.boolean('bano_privado').notNullable().defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('mesa_trabajo')
      table.dropColumn('bano_privado')
    })
  }
}
