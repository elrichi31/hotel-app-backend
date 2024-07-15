import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class HabitacionSchema extends BaseSchema {
  protected tableName = 'habitacion'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('numero', 10).notNullable().unique()
      table.string('tipo', 50).notNullable()
      table.string('estado', 20).defaultTo('disponible')
      table.text('descripcion')
      table.integer('numero_camas').notNullable().defaultTo(1)
      table.date('fecha_inicio_ocupacion').nullable()
      table.date('fecha_fin_ocupacion').nullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
