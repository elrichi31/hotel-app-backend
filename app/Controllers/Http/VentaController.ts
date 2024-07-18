import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Venta from 'App/Models/Venta'
import Habitacion from 'App/Models/Habitacion'
import VentaHabitacionPrecio from 'App/Models/VentaHabitacionPrecio'

export default class VentaController {
  public async index({ response }: HttpContextContract) {
    try {
      const ventas = await Venta.query()
        .preload('personas')
        .preload('precios', (query) => {
          query.preload('habitacion')
        })
      return response.json(ventas)
    } catch (error) {
      console.error('Error fetching ventas:', error)
      return response.status(500).json({ message: 'Error fetching ventas', error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const venta = await Venta.query()
        .where('id', params.id)
        .preload('personas')
        .preload('precios', (query) => {
          query.preload('habitacion')
        })
        .firstOrFail()
      return response.json(venta)
    } catch (error) {
      console.error('Error fetching venta:', error)
      return response.status(404).json({ message: 'Venta not found', error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const { personas, habitaciones, precios, fecha_inicio, fecha_fin, descuento, subtotal, total } = request.only(['personas', 'habitaciones', 'precios', 'fecha_inicio', 'fecha_fin', 'descuento', 'subtotal', 'total'])

    try {
      // Crear la venta
      const venta = await Venta.create({
        fechaInicio: fecha_inicio,
        fechaFin: fecha_fin,
        descuento,
        subtotal,
        total,
      })

      // Asociar personas a la venta
      await venta.related('personas').attach(personas)

      // Asociar habitaciones y precios a la venta
      for (const habitacionId of habitaciones) {
        const precioId = precios[habitacionId]
        await VentaHabitacionPrecio.create({
          ventaId: venta.id,
          habitacionId,
          precioId,
        })

        // Actualizar la habitación con los rangos de fechas
        const habitacion = await Habitacion.findOrFail(habitacionId)
        habitacion.merge({
          fechaInicioOcupacion: fecha_inicio,
          fechaFinOcupacion: fecha_fin,
          estado: 'Ocupado',
        })
        await habitacion.save()
      }

      return response.status(201).json(venta)
    } catch (error) {
      console.error('Error creating venta:', error)
      return response.status(400).json({ message: 'Error creating venta', error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { personas, habitaciones, precios, fecha_inicio, fecha_fin, descuento, subtotal, total } = request.only(['personas', 'habitaciones', 'precios', 'fecha_inicio', 'fecha_fin', 'descuento', 'subtotal', 'total'])

    try {
      const venta = await Venta.findOrFail(params.id)

      // Actualizar la venta
      venta.merge({
        fechaInicio: fecha_inicio,
        fechaFin: fecha_fin,
        descuento,
        subtotal,
        total,
      })
      await venta.save()

      // Actualizar las relaciones de personas
      await venta.related('personas').sync(personas)

      // Actualizar las relaciones de habitaciones y precios
      await VentaHabitacionPrecio.query().where('ventaId', venta.id).delete()
      for (const habitacionId of habitaciones) {
        const precioId = precios[habitacionId]
        await VentaHabitacionPrecio.create({
          ventaId: venta.id,
          habitacionId,
          precioId,
        })

        // Actualizar la habitación con los nuevos rangos de fechas
        const habitacion = await Habitacion.findOrFail(habitacionId)
        habitacion.merge({
          fechaInicioOcupacion: fecha_inicio,
          fechaFinOcupacion: fecha_fin,
          estado: 'Ocupado',
        })
        await habitacion.save()
      }

      return response.json(venta)
    } catch (error) {
      console.error('Error updating venta:', error)
      return response.status(400).json({ message: 'Error updating venta', error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const venta = await Venta.findOrFail(params.id)
      await venta.delete()
      return response.status(204).json(null)
    } catch (error) {
      console.error('Error deleting venta:', error)
      return response.status(400).json({ message: 'Error deleting venta', error })
    }
  }
}
