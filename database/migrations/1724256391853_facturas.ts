import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Facturas extends BaseSchema {
  protected tableName = 'facturas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary Key
      table.string('nombre', 255).notNullable() // Nombre del cliente
      table.string('apellido', 255).notNullable() // Apellido del cliente
      table.string('identificacion', 20).notNullable() // Cédula o RUC del cliente
      table.string('direccion', 255).notNullable() // Dirección del cliente
      table.string('telefono', 20).nullable() // Teléfono del cliente (opcional)
      table.string('correo', 255).notNullable() // Correo electrónico del cliente
      table.string('numero_factura', 50).unique().notNullable() // Número de la factura
      table.timestamp('fecha_emision', { useTz: true }).notNullable() // Fecha de emisión de la factura
      table.text('descripcion').notNullable() // Descripción de productos o servicios
      table.integer('cantidad').unsigned().notNullable() // Cantidad de productos o servicios
      table.decimal('precio_unitario', 10, 2).notNullable() // Precio unitario
      table.decimal('subtotal', 10, 2).notNullable() // Subtotal (antes de descuentos e impuestos)
      table.decimal('descuento', 10, 2).defaultTo(0).notNullable() // Descuento aplicado
      table.decimal('iva', 10, 2).notNullable() // Impuesto al Valor Agregado (IVA)
      table.decimal('otros_impuestos', 10, 2).defaultTo(0).notNullable() // Otros impuestos
      table.decimal('total', 10, 2).notNullable() // Total a pagar (incluye impuestos)
      table.string('forma_pago', 50).notNullable() // Forma de pago
      table.text('observaciones').nullable() // Observaciones (opcional)

      table.integer('venta_id').unsigned().notNullable().references('id').inTable('ventas').onDelete('CASCADE') // Relación con la tabla ventas

      table.timestamp('created_at', { useTz: true }) // Fecha de creación
      table.timestamp('updated_at', { useTz: true }) // Fecha de actualización
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
