import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterHabitacionesTable extends BaseSchema {
  protected tableName = 'habitacion'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dateTime('fecha_inicio_ocupacion').alter()
      table.dateTime('fecha_fin_ocupacion').alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.date('fecha_inicio_ocupacion').alter()
      table.date('fecha_fin_ocupacion').alter()
    })
  }
}
