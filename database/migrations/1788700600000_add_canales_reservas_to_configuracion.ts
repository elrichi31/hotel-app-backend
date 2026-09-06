import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddCanalesReservasToConfiguracion extends BaseSchema {
  protected tableName = 'configuracion'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('reservas_nativas_activas').notNullable().defaultTo(true)
      table.boolean('reservas_libres_activas').notNullable().defaultTo(false)
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reservas_nativas_activas')
      table.dropColumn('reservas_libres_activas')
    })
  }
}
