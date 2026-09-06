import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import Reserva from 'App/Models/Reserva'
import Habitacion from 'App/Models/Habitacion'
import ReservaHabitacionPrecio from 'App/Models/ReservaHabitacionPrecio'
import Venta from 'App/Models/Venta'
import VentaHabitacionPrecio from 'App/Models/VentaHabitacionPrecio'
import Mail from '@ioc:Adonis/Addons/Mail'
import { habitacionDisponible } from 'App/Helpers/Disponibilidad'

/** `reserva.fecha_inicio`/`fecha_fin` llegan como Date o string desde la BD; las columnas dateTime de Venta/Habitacion exigen un luxon.DateTime. */
function toDateTime(value: Date | string | DateTime): DateTime {
  if (value instanceof DateTime) return value
  return DateTime.fromJSDate(new Date(value))
}

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

  // Crear una nueva reserva con habitaciones y precios asociados.
  // La reserva queda 'pendiente': NO ocupa la habitación, solo la reserva
  // tentativamente frente a otras reservas/ventas hasta que un admin la apruebe.
  public async store({ request, response }: HttpContextContract) {
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_inicio,
      fecha_fin,
      numero_personas,
      total,
      habitaciones,
      precios,
    } = request.only([
      'nombre',
      'apellido',
      'email', // Asegúrate de capturar el correo del cliente
      'telefono',
      'fecha_inicio',
      'fecha_fin',
      'numero_personas',
      'total',
      'habitaciones',
      'precios',
    ])

    try {
      // Verificar disponibilidad antes de crear nada
      for (const habitacionId of habitaciones) {
        const disponible = await habitacionDisponible(habitacionId, fecha_inicio, fecha_fin)
        if (!disponible) {
          const habitacion = await Habitacion.find(habitacionId)
          return response.status(409).json({
            message: `La habitación ${habitacion?.numero ?? habitacionId} no está disponible para esas fechas`,
          })
        }
      }

      // Crear la reserva (estado 'pendiente' por defecto)
      const reserva = new Reserva()
      reserva.nombre = nombre
      reserva.apellido = apellido
      reserva.email = email
      reserva.telefono = telefono
      reserva.fecha_inicio = fecha_inicio
      reserva.fecha_fin = fecha_fin
      reserva.numero_personas = numero_personas
      reserva.estado = 'pendiente'
      reserva.total = total

      await reserva.save()

      // Asociar habitaciones y precios a la reserva (sin tocar el estado de la habitación:
      // eso solo pasa cuando el admin aprueba la reserva y se genera la venta)
      for (const habitacionId of habitaciones) {
        const precioId = precios[habitacionId]
        await ReservaHabitacionPrecio.create({
          reservaId: reserva.id,
          habitacionId,
          precioId,
        })
      }

      // Contenido del correo electrónico
      const emailContent = `
        <h1>Confirmación de Reserva</h1>
        <p>Estimado/a ${nombre} ${apellido},</p>
        <p>Gracias por realizar tu reserva en nuestra plataforma. Por favor, confirma tu reserva usando el enlace a continuación:</p>
        <p><a href="${process.env.FRONTEND_URL}/reservar/confirm-reserva/${reserva.id}">Confirmar Reserva</a></p>
        <p>Detalles de tu reserva:</p>
        <ul>
          <li><strong>Fecha de inicio:</strong> ${fecha_inicio}</li>
          <li><strong>Fecha de fin:</strong> ${fecha_fin}</li>
          <li><strong>Número de personas:</strong> ${numero_personas}</li>
          <li><strong>Total:</strong> ${total}</li>
        </ul>
        <p>Tu reserva queda pendiente de aprobación por parte del hotel. Te avisaremos por este medio cuando quede confirmada.</p>
        <p>Si tienes alguna duda, no dudes en contactarnos.</p>
        <p>Saludos,<br>El equipo del hotel</p>
      `;

      // Enviar el correo electrónico
      await Mail.send((message) => {
        message
          .from(`noreply@${process.env.MAILGUN_DOMAIN}`)
          .to(email) // Correo del cliente
          .subject('Confirmación de tu reserva')
          .html(emailContent)
      })

      return response.status(201).json(reserva)
    } catch (error) {
      console.error('Error creating reserva:', error)
      return response.status(400).json({ message: 'Error creating reserva', error })
    }
  }

  // Actualizar una reserva existente (sigue sin tocar la habitación: esa acción vive en aprobar/rechazar)
  public async update({ params, request, response }: HttpContextContract) {
    const {
      nombre,
      apellido,
      telefono,
      fecha_inicio,
      fecha_fin,
      numero_personas,
      total,
      habitaciones,
      precios,
    } = request.only([
      'nombre',
      'apellido',
      'telefono',
      'fecha_inicio',
      'fecha_fin',
      'numero_personas',
      'total',
      'habitaciones',
      'precios',
    ])

    try {
      const reserva = await Reserva.findOrFail(params.id)

      if (reserva.estado === 'aprobada') {
        return response.status(400).json({
          message: 'Esta reserva ya fue aprobada y convertida en venta; edítala desde Ventas',
        })
      }

      // Verificar disponibilidad de las nuevas habitaciones (ignorando el hold de esta misma reserva)
      for (const habitacionId of habitaciones) {
        const disponible = await habitacionDisponible(habitacionId, fecha_inicio, fecha_fin, {
          excludeReservaId: reserva.id,
        })
        if (!disponible) {
          const habitacion = await Habitacion.find(habitacionId)
          return response.status(409).json({
            message: `La habitación ${habitacion?.numero ?? habitacionId} no está disponible para esas fechas`,
          })
        }
      }

      reserva.merge({
        nombre,
        apellido,
        telefono,
        fecha_inicio,
        fecha_fin,
        numero_personas,
        total,
      })
      await reserva.save()

      // Actualizar las relaciones de habitaciones y precios
      await ReservaHabitacionPrecio.query().where('reserva_id', reserva.id).delete()
      for (const habitacionId of habitaciones) {
        const precioId = precios[habitacionId]
        await ReservaHabitacionPrecio.create({
          reservaId: reserva.id,
          habitacionId,
          precioId,
        })
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

  // Obtener habitaciones disponibles entre dos fechas: ni ocupadas físicamente,
  // ni con una venta activa, ni con otra reserva viva que se solape.
  public async availableRooms({ request, response }: HttpContextContract) {
    const { fecha_inicio, fecha_fin } = request.only(['fecha_inicio', 'fecha_fin'])

    try {
      const habitaciones = await Habitacion.query().preload('precios')

      const disponibles = await Promise.all(
        habitaciones.map(async (habitacion) => ({
          habitacion,
          disponible: await habitacionDisponible(habitacion.id, fecha_inicio, fecha_fin),
        }))
      )

      return response.json(disponibles.filter((h) => h.disponible).map((h) => h.habitacion))
    } catch (error) {
      console.error('Error fetching available rooms:', error)
      return response.status(500).json({ message: 'Error fetching available rooms', error })
    }
  }

  // El cliente confirma por email que sigue interesado (no ocupa la habitación por sí solo)
  public async confirmReserva({ params, response }: HttpContextContract) {
    try {
      const reserva = await Reserva.findOrFail(params.id)

      if (reserva.estado !== 'pendiente') {
        return response.status(400).json({
          message: `No se puede confirmar una reserva en estado '${reserva.estado}'`,
        })
      }

      reserva.estado = 'confirmado'
      await reserva.save()

      return response.json({ message: 'Reserva confirmada exitosamente', reserva })
    } catch (error) {
      console.error('Error confirming reserva:', error)
      return response.status(400).json({ message: 'Error confirming reserva', error })
    }
  }

  // El admin aprueba la reserva: recién aquí se ocupan las habitaciones, convirtiendo
  // la reserva en una Venta real que sigue su propio ciclo de check-in/check-out.
  public async aprobar({ params, auth, response }: HttpContextContract) {
    try {
      const reserva = await Reserva.findOrFail(params.id)

      if (!['pendiente', 'confirmado'].includes(reserva.estado)) {
        return response.status(400).json({
          message: `No se puede aprobar una reserva en estado '${reserva.estado}'`,
        })
      }

      const pivotRows = await ReservaHabitacionPrecio.query().where('reservaId', reserva.id)
      if (pivotRows.length === 0) {
        return response.status(400).json({ message: 'La reserva no tiene habitaciones asociadas' })
      }

      // Revalidar disponibilidad: puede haber pasado tiempo desde que se creó la reserva
      for (const row of pivotRows) {
        const disponible = await habitacionDisponible(row.habitacionId, reserva.fecha_inicio, reserva.fecha_fin, {
          excludeReservaId: reserva.id,
        })
        if (!disponible) {
          const habitacion = await Habitacion.find(row.habitacionId)
          return response.status(409).json({
            message: `La habitación ${habitacion?.numero ?? row.habitacionId} ya no está disponible para esas fechas`,
          })
        }
      }

      const usuario = await auth.authenticate()

      const fechaInicio = toDateTime(reserva.fecha_inicio)
      const fechaFin = toDateTime(reserva.fecha_fin)

      const venta = await Venta.create({
        fechaInicio,
        fechaFin,
        descuento: 0,
        subtotal: reserva.total,
        total: reserva.total,
        usuarioId: usuario.id,
      })

      for (const row of pivotRows) {
        await VentaHabitacionPrecio.create({
          ventaId: venta.id,
          habitacionId: row.habitacionId,
          precioId: row.precioId,
        })

        const habitacion = await Habitacion.findOrFail(row.habitacionId)
        habitacion.merge({
          fechaInicioOcupacion: fechaInicio,
          fechaFinOcupacion: fechaFin,
          estado: 'Ocupado',
        })
        await habitacion.save()
      }

      reserva.estado = 'aprobada'
      reserva.ventaId = venta.id
      await reserva.save()

      return response.json({ message: 'Reserva aprobada y convertida en venta', reserva, venta })
    } catch (error) {
      console.error('Error approving reserva:', error)
      return response.status(400).json({ message: 'Error approving reserva', error })
    }
  }

  // El admin rechaza la reserva: no se genera ninguna venta ni se ocupa nada.
  public async rechazar({ params, response }: HttpContextContract) {
    try {
      const reserva = await Reserva.findOrFail(params.id)

      if (!['pendiente', 'confirmado'].includes(reserva.estado)) {
        return response.status(400).json({
          message: `No se puede rechazar una reserva en estado '${reserva.estado}'`,
        })
      }

      reserva.estado = 'cancelada'
      await reserva.save()

      return response.json({ message: 'Reserva rechazada', reserva })
    } catch (error) {
      console.error('Error rejecting reserva:', error)
      return response.status(400).json({ message: 'Error rejecting reserva', error })
    }
  }
}
