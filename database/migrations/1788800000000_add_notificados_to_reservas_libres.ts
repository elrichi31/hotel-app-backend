import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddNotificadosToReservasLibres extends BaseSchema {
  protected tableName = 'reservas_libres'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Foto de los usuarios a quienes se les envió el aviso por correo: [{ id, nombre, email }].
      // Se guarda el nombre y no solo el id para que siga mostrándose si el usuario se borra.
      table.json('notificados').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('notificados')
    })
  }
}
