import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class AddRoleAndStatusToUsers extends BaseSchema {
  protected tableName = 'users';

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role', 50).notNullable().defaultTo('empleado'); // Agregar columna 'role'
      table.string('status', 50).notNullable().defaultTo('activo'); // Agregar columna 'status'
    });
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role');
      table.dropColumn('status');
    });
  }
}
