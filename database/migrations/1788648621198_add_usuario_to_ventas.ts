import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddUsuarioToVentas extends BaseSchema {
  protected tableName = 'ventas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('usuario_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('usuario_id')
    })
  }
}
