import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class RegistroPersonaSchema extends BaseSchema {
  protected tableName = 'registro_persona'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable()
      table.string('apellido', 100).notNullable()
      table.enu('tipo_documento', ['cedula', 'pasaporte']).notNullable()
      table.string('numero_documento', 50).notNullable().unique()
      table.string('ciudadania', 100).notNullable()
      table.string('procedencia', 100).notNullable()
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
