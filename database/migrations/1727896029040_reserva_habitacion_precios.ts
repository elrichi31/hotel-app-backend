import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reserva_habitacion_precios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('reserva_id').unsigned().references('id').inTable('reservas').onDelete('CASCADE')
      table.integer('habitacion_id').unsigned().references('id').inTable('habitacion').onDelete('CASCADE')
      table.integer('precio_id').unsigned().references('id').inTable('precios').onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
