import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Venta from 'App/Models/Venta'
import VentaHabitacion from 'App/Models/VentaHabitacion'

export default class VentaController {
  public async index({ response }: HttpContextContract) {
    const ventas = await Venta.query().preload('habitaciones')
    return response.status(200).json(ventas)
  }

  // Obtener una venta específica
  public async show({ params, response }: HttpContextContract) {
    try {
      const venta = await Venta.query().where('id', params.id).preload('habitaciones').firstOrFail()
      return response.status(200).json(venta)
    } catch (error) {
      return response.status(404).json({ message: 'Venta no encontrada' })
    }
  }

  // Crear una nueva venta con habitaciones
  public async store({ request, response }: HttpContextContract) {
    const data = request.only([
      'idCliente', 'nombre', 'apellido', 'cedula', 'direccion', 'telefono', 
      'total', 'numeroPersonas', 'metodoPago'
    ])
    const habitacionIds = request.input('habitacionIds', [])

    const venta = await Venta.create(data)
    await venta.related('habitaciones').createMany(habitacionIds.map(habitacionId => ({
      habitacionId
    })))

    return response.status(201).json(venta)
  }

  // Actualizar una venta existente
  public async update({ request, response, params }: HttpContextContract) {
    const data = request.only([
      'idCliente', 'nombre', 'apellido', 'cedula', 'direccion', 'telefono', 
      'total', 'numeroPersonas', 'metodoPago'
    ])
    const habitacionIds = request.input('habitacionIds', [])

    const venta = await Venta.findOrFail(params.id)
    venta.merge(data)
    await venta.save()

    // Actualizar habitaciones asociadas
    await VentaHabitacion.query().where('ventaId', venta.id).delete()
    await venta.related('habitaciones').createMany(habitacionIds.map(habitacionId => ({
      habitacionId
    })))

    return response.status(200).json(venta)
  }

  // Borrar una venta
  public async destroy({ response, params }: HttpContextContract) {
    const venta = await Venta.findOrFail(params.id)
    await venta.related('habitaciones').query().delete()
    await venta.delete()
    return response.status(204).json(null)
  }
}
