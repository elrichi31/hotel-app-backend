import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PersonaVenta extends BaseSchema {
  protected tableName = 'persona_venta'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('persona_id').unsigned().references('id').inTable('registro_persona').onDelete('CASCADE')
      table.integer('venta_id').unsigned().references('id').inTable('ventas').onDelete('CASCADE')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
