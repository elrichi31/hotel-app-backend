import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Reserva from 'App/Models/Reserva'
import Habitacion from 'App/Models/Habitacion'
import ReservaHabitacionPrecio from 'App/Models/ReservaHabitacionPrecio'

export default class ReservasController {
  // Obtener todas las reservas con las habitaciones y precios asociados
  public async index({ response }: HttpContextContract) {
    try {
      const reservas = await Reserva.query()
        .preload('precios', (query) => {
          query.preload('habitacion')
        })
      return response.json(reservas)
    } catch (error) {
      console.error('Error fetching reservas:', error)
      return response.status(500).json({ message: 'Error fetching reservas', error })
    }
  }

  // Mostrar una reserva específica con habitaciones y precios asociados
  public async show({ params, response }: HttpContextContract) {
    try {
      const reserva = await Reserva.query()
        .where('id', params.id)
        .preload('habitaciones')
        .preload('precios', (query) => {
          query.preload('habitacion')
        })
        .firstOrFail()
      return response.json(reserva)
    } catch (error) {
      console.error('Error fetching reserva:', error)
      return response.status(404).json({ message: 'Reserva not found', error })
    }
  }

  // Crear una nueva reserva con habitaciones y precios asociados
  public async store({ request, response }: HttpContextContract) {
    const {
      nombre,
      apellido,
      fecha_inicio,
      fecha_fin,
      numero_personas,
      estado,
      total,
      habitaciones,
      precios,
    } = request.only([
      'nombre',
      'apellido',
      'fecha_inicio',
      'fecha_fin',
      'numero_personas',
      'estado',
      'total',
      'habitaciones',
      'precios',
    ])

    try {
      // Crear la reserva
      const reserva = new Reserva()
      reserva.nombre = nombre
      reserva.apellido = apellido
      reserva.fecha_inicio = fecha_inicio
      reserva.fecha_fin = fecha_fin
      reserva.numero_personas = numero_personas
      reserva.estado = estado
      reserva.total = total

      // Guardar la reserva en la base de datos
      await reserva.save()

      // Asociar habitaciones y precios a la reserva
      for (const habitacionId of habitaciones) {
        const precioId = precios[habitacionId]
        await ReservaHabitacionPrecio.create({
          reservaId: reserva.id,
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

      return response.status(201).json(reserva)
    } catch (error) {
      console.error('Error creating reserva:', error)
      return response.status(400).json({ message: 'Error creating reserva', error })
    }
  }

  // Actualizar una reserva existente
  public async update({ params, request, response }: HttpContextContract) {
    const {
      nombre,
      apellido,
      fecha_inicio,
      fecha_fin,
      numero_personas,
      estado,
      total,
      habitaciones,
      precios,
    } = request.only([
      'nombre',
      'apellido',
      'fecha_inicio',
      'fecha_fin',
      'numero_personas',
      'estado',
      'total',
      'habitaciones',
      'precios',
    ])

    try {
      const reserva = await Reserva.findOrFail(params.id)

      // Actualizar la reserva
      reserva.merge({
        nombre,
        apellido,
        fecha_inicio,
        fecha_fin,
        numero_personas,
        estado,
        total,
      })
      await reserva.save()

      // Eliminar las relaciones anteriores de habitaciones y precios
      await ReservaHabitacionPrecio.query().where('reserva_id', reserva.id).delete()

      // Actualizar las relaciones de habitaciones y precios
      for (const habitacionId of habitaciones) {
        const precioId = precios[habitacionId]
        await ReservaHabitacionPrecio.create({
          reservaId: reserva.id,
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

      return response.json(reserva)
    } catch (error) {
      console.error('Error updating reserva:', error)
      return response.status(400).json({ message: 'Error updating reserva', error })
    }
  }

  // Eliminar una reserva
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const reserva = await Reserva.findOrFail(params.id)
      await reserva.delete()
      return response.status(204).json(null)
    } catch (error) {
      console.error('Error deleting reserva:', error)
      return response.status(400).json({ message: 'Error deleting reserva', error })
    }
  }

  // Obtener habitaciones disponibles entre dos fechas
  public async availableRooms({ request, response }: HttpContextContract) {
    const { fecha_inicio, fecha_fin } = request.only(['fecha_inicio', 'fecha_fin'])
    try {
      // Consulta para obtener habitaciones que no tengan una reserva en conflicto con las fechas proporcionadas
      const habitacionesDisponibles = await Habitacion.query().preload('precios')
        .whereNot((query) => {
          query
            .where('fechaInicioOcupacion', '<', fecha_fin)
            .andWhere('fechaFinOcupacion', '>', fecha_inicio)
        })

      return response.json(habitacionesDisponibles)
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      return response.status(500).json({ message: 'Error fetching available rooms', error })
    }
  }



}
