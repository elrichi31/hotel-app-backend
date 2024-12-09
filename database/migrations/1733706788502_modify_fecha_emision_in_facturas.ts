import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ModifyFechaEmisionInFacturas extends BaseSchema {
  protected tableName = 'facturas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      // Cambiar el tipo de fecha_emision a date (sin zona horaria)
      table.date('fecha_emision').notNullable().alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      // Revertir el cambio a timestamp con zona horaria en caso de rollback
      table.timestamp('fecha_emision', { useTz: true }).notNullable().alter()
    })
  }
}
