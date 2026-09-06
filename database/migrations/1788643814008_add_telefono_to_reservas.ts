import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddTelefonoToReservas extends BaseSchema {
  protected tableName = 'reservas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('telefono').notNullable().after('email')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('telefono')
    })
  }
}
