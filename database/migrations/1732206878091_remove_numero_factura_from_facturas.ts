import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RemoveNumeroFacturaFromFacturas extends BaseSchema {
  protected tableName = 'facturas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('numero_factura')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('numero_factura', 50).unique().notNullable()
    })
  }
}
