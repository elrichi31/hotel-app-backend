import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddApiKeyToConfiguracion extends BaseSchema {
  protected tableName = 'configuracion'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('reservas_libres_api_key', 64).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('reservas_libres_api_key')
    })
  }
}
