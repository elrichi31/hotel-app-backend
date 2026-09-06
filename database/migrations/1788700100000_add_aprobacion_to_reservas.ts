import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddAprobacionToReservas extends BaseSchema {
  protected tableName = 'reservas'

  public async up() {
    // MySQL no permite agregar un valor a un enum con `.alter()` de knex de forma confiable,
    // así que se modifica la columna directamente.
    this.schema.raw(
      "ALTER TABLE reservas MODIFY estado ENUM('pendiente', 'confirmado', 'aprobada', 'cancelada') NOT NULL DEFAULT 'pendiente'"
    )

    this.schema.alterTable(this.tableName, (table) => {
      table.integer('venta_id').unsigned().nullable().references('id').inTable('ventas').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('venta_id')
    })

    this.schema.raw(
      "ALTER TABLE reservas MODIFY estado ENUM('pendiente', 'confirmado', 'cancelada') NOT NULL DEFAULT 'pendiente'"
    )
  }
}
