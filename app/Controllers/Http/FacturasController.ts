import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Factura from 'App/Models/Factura'
import Venta from 'App/Models/Venta'

export default class FacturasController {
  
  // Obtener todas las facturas
  public async index({ response }: HttpContextContract) {
    try {
      const facturas = await Factura.query().preload('venta')
      return response.status(200).json(facturas)
    } catch (error) {
      console.error('Error fetching facturas:', error)
      return response.status(500).json({ message: 'Error fetching facturas', error })
    }
  }

  // Obtener una factura por ID
  public async show({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.query()
        .where('id', params.id)
        .preload('venta')
        .firstOrFail()
      return response.status(200).json(factura)
    } catch (error) {
      console.error('Error fetching factura:', error)
      return response.status(404).json({ message: 'Factura not found', error })
    }
  }

  // Crear una nueva factura
  public async store({ request, response }: HttpContextContract) {
    const { 
      nombre, 
      apellido,
      identificacion, 
      direccion, 
      telefono, 
      correo, 
      numero_factura, 
      fecha_emision, 
      descripcion, 
      cantidad, 
      precio_unitario, 
      subtotal, 
      descuento, 
      iva, 
      otros_impuestos, 
      total, 
      forma_pago, 
      observaciones, 
      venta_id // Aquí incluimos el ID de la venta
    } = request.only([
      'nombre', 
      'apellido',
      'identificacion', 
      'direccion', 
      'telefono', 
      'correo', 
      'numero_factura', 
      'fecha_emision', 
      'descripcion', 
      'cantidad', 
      'precio_unitario', 
      'subtotal', 
      'descuento', 
      'iva', 
      'otros_impuestos', 
      'total', 
      'forma_pago', 
      'observaciones', 
      'venta_id' // Este es el ID de la venta asociado
    ])

    try {
      // Verificar si la venta existe
      await Venta.findOrFail(venta_id)

      // Crear la factura vinculada a la venta
      const factura = await Factura.create({
        nombre,
        apellido,
        identificacion,
        direccion,
        telefono,
        correo,
        numero_factura,
        fecha_emision,
        descripcion,
        cantidad,
        precio_unitario,
        subtotal,
        descuento,
        iva,
        otros_impuestos,
        total,
        forma_pago,
        observaciones,
        ventaId: venta_id // Asignar el ID de la venta
      })

      return response.status(201).json(factura)
    } catch (error) {
      console.error('Error creating factura:', error)
      return response.status(400).json({ message: 'Error creating factura', error })
    }
  }

  // Actualizar una factura existente
  public async update({ params, request, response }: HttpContextContract) {
    const { 
      nombre, 
      apellido,
      identificacion, 
      direccion, 
      telefono, 
      correo, 
      numero_factura, 
      fecha_emision, 
      descripcion, 
      cantidad, 
      precio_unitario, 
      subtotal, 
      descuento, 
      iva, 
      otros_impuestos, 
      total, 
      forma_pago, 
      observaciones, 
      venta_id 
    } = request.only([
      'nombre', 
      'apellido',
      'identificacion', 
      'direccion', 
      'telefono', 
      'correo', 
      'numero_factura', 
      'fecha_emision', 
      'descripcion', 
      'cantidad', 
      'precio_unitario', 
      'subtotal', 
      'descuento', 
      'iva', 
      'otros_impuestos', 
      'total', 
      'forma_pago', 
      'observaciones', 
      'venta_id'
    ])

    try {
      const factura = await Factura.findOrFail(params.id)

      // Verificar si la venta existe
      await Venta.findOrFail(venta_id)

      // Actualizar la factura
      factura.merge({
        nombre,
        apellido,
        identificacion,
        direccion,
        telefono,
        correo,
        numero_factura,
        fecha_emision,
        descripcion,
        cantidad,
        precio_unitario,
        subtotal,
        descuento,
        iva,
        otros_impuestos,
        total,
        forma_pago,
        observaciones,
        ventaId: venta_id // Asegurar que la factura sigue vinculada a una venta
      })

      await factura.save()

      return response.status(200).json(factura)
    } catch (error) {
      console.error('Error updating factura:', error)
      return response.status(400).json({ message: 'Error updating factura', error })
    }
  }

  // Eliminar una factura
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.findOrFail(params.id)
      await factura.delete()
      return response.status(204).json(null)
    } catch (error) {
      console.error('Error deleting factura:', error)
      return response.status(400).json({ message: 'Error deleting factura', error })
    }
  }

  // Obtener todas las facturas asociadas a una venta
  public async getFacturasByVenta({ params, response }: HttpContextContract) {
    try {
      const facturas = await Factura.query()
        .where('venta_id', params.id)
      return response.status(200).json(facturas)
    } catch (error) {
      console.error('Error fetching facturas:', error)
      return response.status(400).json({ message: 'Error fetching facturas', error })
    }
  }
}
