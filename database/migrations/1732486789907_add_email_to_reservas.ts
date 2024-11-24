import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddEmailToReservas extends BaseSchema {
  protected tableName = 'reservas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('email').notNullable().after('apellido') // Añade la columna 'email' después de 'apellido'
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('email') // Elimina la columna 'email'
    })
  }
}
