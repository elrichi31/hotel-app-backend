import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCheckinCheckoutToVentas extends BaseSchema {
  protected tableName = 'ventas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.enum('estado', ['reservado', 'check_in', 'check_out', 'cancelada']).notNullable().defaultTo('reservado')
      table.datetime('fecha_checkin').nullable()
      table.datetime('fecha_checkout').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('estado')
      table.dropColumn('fecha_checkin')
      table.dropColumn('fecha_checkout')
    })
  }
}
