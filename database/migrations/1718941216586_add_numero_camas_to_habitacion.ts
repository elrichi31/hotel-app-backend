import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddNumeroCamasToHabitacion extends BaseSchema {
  protected tableName = 'habitacion'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('numero_camas').notNullable().defaultTo(1)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('numero_camas')
    })
  }
}
