import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Habitacion from 'App/Models/Habitacion'

export default class HabitacionController {
  // Listar todas las habitaciones
  public async index({ response }: HttpContextContract) {
    const habitaciones = await Habitacion.all()
    return response.status(200).json(habitaciones)
  }

  // Obtener una habitación específica
  public async show({ params, response }: HttpContextContract) {
    try {
      const habitacion = await Habitacion.findOrFail(params.id)
      return response.status(200).json(habitacion)
    } catch (error) {
      return response.status(404).json({ message: 'Habitación no encontrada' })
    }
  }

  // Crear una nueva habitación
  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['numero', 'tipo', 'precio', 'estado', 'descripcion', 'numeroCamas'])
    const habitacion = await Habitacion.create(data)
    return response.status(201).json(habitacion)
  }

  // Actualizar una habitación existente
  public async update({ request, response, params }: HttpContextContract) {
    const data = request.only(['numero', 'tipo', 'precio', 'estado', 'descripcion', 'numeroCamas'])
    const habitacion = await Habitacion.findOrFail(params.id)
    habitacion.merge(data)
    await habitacion.save()
    return response.status(200).json(habitacion)
  }

  // Borrar una habitación
  public async destroy({ response, params }: HttpContextContract) {
    const habitacion = await Habitacion.findOrFail(params.id)
    await habitacion.delete()
    return response.status(204).json(null)
  }
}
