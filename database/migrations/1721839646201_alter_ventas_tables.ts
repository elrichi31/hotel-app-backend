import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterVentasTable extends BaseSchema {
  protected tableName = 'ventas'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.datetime('fecha_inicio').alter()// Cambiar de tipo `date` a `datetime`
      table.datetime('fecha_fin').alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('fecha_inicio').alter()// Suponiendo que antes eran de tipo `date`
      table.date('fecha_fin').alter()
    })
  }
}
