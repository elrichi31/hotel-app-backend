import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Habitacion from 'App/Models/Habitacion'
import Precio from 'App/Models/Precio'

export default class HabitacionController {
  public async index({ response }: HttpContextContract) {
    try {
      const habitaciones = await Habitacion.query().preload('precios')
      return response.json(habitaciones)
    } catch (error) {
      return response.status(500).json({ message: 'Error fetching habitaciones', error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const habitacionData = request.body()

    try {
      const { numero, tipo, estado, descripcion, numero_camas, fechaInicioOcupacion, fechaFinOcupacion, precios } = habitacionData
      const data = { numero, tipo, estado, descripcion, numeroCamas: numero_camas, fechaInicioOcupacion, fechaFinOcupacion }

      // Verificar si el número de habitación ya existe
      const existingHabitacion = await Habitacion.findBy('numero', numero)
      if (existingHabitacion) {
        return response.status(400).json({ message: 'El número de habitación ya existe' })
      }

      const habitacion = await Habitacion.create(data)

      if (precios && Array.isArray(precios)) {
        for (const precioData of precios) {
          await habitacion.related('precios').create(precioData)
        }
      }

      await habitacion.load('precios') // Asegúrate de cargar los precios

      return response.status(201).json(habitacion)
    } catch (error) {
      console.error('Error creating habitacion:', error)
      return response.status(400).json({ message: 'Error creating habitacion', error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const habitacion = await Habitacion.query().preload('precios').where('id', params.id).firstOrFail()
      return response.json(habitacion)
    } catch (error) {
      return response.status(404).json({ message: 'Habitacion not found', error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const data = request.only(['numero', 'tipo', 'estado', 'descripcion', 'numero_camas', 'fechaInicioOcupacion', 'fechaFinOcupacion', 'precios'])

    try {
      const habitacion = await Habitacion.findOrFail(params.id)
      const precios = data.precios
      delete data.precios

      habitacion.merge({ ...data, numeroCamas: data.numero_camas })
      await habitacion.save()

      if (precios && Array.isArray(precios)) {
        await Precio.query().where('habitacion_id', habitacion.id).delete()
        for (const precioData of precios) {
          await habitacion.related('precios').create(precioData)
        }
      }

      await habitacion.load('precios')

      return response.json(habitacion)
    } catch (error) {
      return response.status(400).json({ message: 'Error updating habitacion', error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const habitacion = await Habitacion.findOrFail(params.id)
      await habitacion.delete()
      return response.status(204).json(null)
    } catch (error) {
      return response.status(400).json({ message: 'Error deleting habitacion', error })
    }
  }

  public async findByNumero({ params, response }: HttpContextContract) {
    try {
      const habitacion = await Habitacion.query().preload('precios').where('numero', params.numero).firstOrFail()
      return response.json(habitacion)
    } catch (error) {
      return response.status(404).json({ message: 'Habitacion not found', error })
    }
  }
}
