import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Ventas extends BaseSchema {
  protected tableName = 'ventas'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.date('fecha_inicio').notNullable()
      table.date('fecha_fin').notNullable()
      table.decimal('descuento', 10, 2).notNullable().defaultTo(0)
      table.decimal('subtotal', 10, 2).notNullable()
      table.decimal('total', 10, 2).notNullable()
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
