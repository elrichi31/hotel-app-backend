import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class CreateReservasLibres extends BaseSchema {
  protected tableName = 'reservas_libres'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre').notNullable()
      table.string('apellido').nullable()
      table.string('email').nullable()
      table.string('telefono').nullable()
      table.date('fecha_inicio').notNullable()
      table.date('fecha_fin').notNullable()
      table.integer('numero_personas').notNullable().defaultTo(1)
      // Texto libre: no corresponde a una habitación real del sistema, viene tal cual del catálogo externo
      table.string('habitacion_descripcion', 255).notNullable()
      // Nombre de la fuente externa (ej. "Booking.com", "Sitio propio de reservas")
      table.string('origen', 150).notNullable()
      table.string('referencia_externa', 150).nullable()
      table.decimal('total', 12, 2).nullable()
      table.text('notas').nullable()
      table.enum('estado', ['pendiente_revision', 'validada', 'descartada']).notNullable().defaultTo('pendiente_revision')
      table.timestamps(true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
