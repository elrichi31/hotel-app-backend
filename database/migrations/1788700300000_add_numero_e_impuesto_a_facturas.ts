import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddNumeroEImpuestoAFacturas extends BaseSchema {
  protected tableName = 'facturas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nullable a nivel de columna: lo completa Factura.asignarNumero (hook afterCreate) justo
      // después del insert, cuando ya existe el id sobre el que se basa el número.
      table.string('numero_factura', 50).nullable().unique()
      table.decimal('porcentaje_iva', 5, 2).notNullable().defaultTo(0)
      table.decimal('impuesto', 10, 2).notNullable().defaultTo(0)
    })

    // Backfill de las facturas que ya existían antes de este campo
    this.schema.raw(
      "UPDATE facturas SET numero_factura = CONCAT('FAC-', LPAD(id, 6, '0')) WHERE numero_factura IS NULL"
    )
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('numero_factura')
      table.dropColumn('porcentaje_iva')
      table.dropColumn('impuesto')
    })
  }
}
