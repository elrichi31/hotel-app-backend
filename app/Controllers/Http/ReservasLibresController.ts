import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ReservaLibre from 'App/Models/ReservaLibre'
import Configuracion from 'App/Models/Configuracion'
import User from 'App/Models/User'
import Mail from '@ioc:Adonis/Addons/Mail'
import { renderEmailTemplate } from 'App/Helpers/EmailTemplate'

export default class ReservasLibresController {
  // Listado para el panel interno
  public async index({ response }: HttpContextContract) {
    try {
      const reservas = await ReservaLibre.query().orderBy('created_at', 'desc')
      return response.json(reservas)
    } catch (error) {
      console.error('Error fetching reservas libres:', error)
      return response.status(500).json({ message: 'Error fetching reservas libres', error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const reserva = await ReservaLibre.findOrFail(params.id)
      return response.json(reserva)
    } catch (error) {
      console.error('Error fetching reserva libre:', error)
      return response.status(404).json({ message: 'Reserva libre not found', error })
    }
  }

  // Ingesta pública: la usa la página externa (protegida por el middleware `apikey`).
  // Nunca toca disponibilidad ni genera una Venta: solo deja el registro para revisión manual.
  public async ingest({ request, response }: HttpContextContract) {
    const {
      nombre,
      apellido,
      email,
      telefono,
      fecha_inicio,
      fecha_fin,
      numero_personas,
      habitacion_descripcion,
      origen,
      referencia_externa,
      total,
      notas,
    } = request.only([
      'nombre',
      'apellido',
      'email',
      'telefono',
      'fecha_inicio',
      'fecha_fin',
      'numero_personas',
      'habitacion_descripcion',
      'origen',
      'referencia_externa',
      'total',
      'notas',
    ])

    if (!nombre || !email || !telefono || !fecha_inicio || !fecha_fin || !habitacion_descripcion || !origen) {
      return response.status(400).json({
        message:
          'Faltan campos requeridos: nombre, email, telefono, fecha_inicio, fecha_fin, habitacion_descripcion, origen',
      })
    }

    try {
      const configuracion = await Configuracion.actual()
      if (!configuracion.reservasLibresActivas) {
        return response.status(403).json({ message: 'El canal de reservas libres está desactivado' })
      }

      const reserva = await ReservaLibre.create({
        nombre,
        apellido: apellido ?? null,
        email: email ?? null,
        telefono: telefono ?? null,
        fecha_inicio,
        fecha_fin,
        numero_personas: numero_personas ?? 1,
        habitacion_descripcion,
        origen,
        referencia_externa: referencia_externa ?? null,
        total: total ?? null,
        notas: notas ?? null,
        estado: 'pendiente_revision',
      })

      await this.notificarNuevaReservaLibre(reserva)

      return response.status(201).json(reserva)
    } catch (error) {
      console.error('Error ingesting reserva libre:', error)
      return response.status(400).json({ message: 'Error creating reserva libre', error })
    }
  }

  // Avisa por correo a los usuarios internos marcados con `notificarReservas`. No se le
  // escribe al cliente final: esa persona reservó en el sitio externo, no directamente con el hotel.
  // Corre en su propio try/catch para que un fallo de correo nunca tumbe la ingesta, que ya
  // quedó guardada en la BD.
  private async notificarNuevaReservaLibre(reserva: ReservaLibre) {
    try {
      const destinatarios = await User.query()
        .where('notificarReservas', true)
        .where('status', 'activo')

      if (destinatarios.length === 0) return

      const cliente = `${reserva.nombre} ${reserva.apellido ?? ''}`.trim()

      const html = await renderEmailTemplate({
        title: 'Nueva reserva libre',
        preheader: `Nueva reserva de ${reserva.origen} — ${cliente}`,
        bodyHtml: `
          <h2 style="margin:0 0 12px 0; font-size:19px;">Llegó una reserva desde un canal externo</h2>
          <p style="margin:0 0 16px 0;">Se registró una reserva libre proveniente de <strong>${reserva.origen}</strong>. No ocupa ninguna habitación ni genera una venta: revísala y valídala manualmente en el panel.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Origen</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.origen}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Cliente</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${cliente}</td>
            </tr>
            ${reserva.email ? `<tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Correo</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.email}</td>
            </tr>` : ''}
            ${reserva.telefono ? `<tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Teléfono</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.telefono}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Habitación (según origen)</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.habitacion_descripcion}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Fecha de inicio</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.fecha_inicio}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Fecha de fin</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.fecha_fin}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; font-size:13.5px; color:#5c6169; border-bottom:1px solid #edeef0;">Número de personas</td>
              <td style="padding:8px 0; font-size:13.5px; font-weight:600; text-align:right; border-bottom:1px solid #edeef0;">${reserva.numero_personas}</td>
            </tr>
            ${reserva.total != null ? `<tr>
              <td style="padding:10px 0 0 0; font-size:14.5px; color:#1f2328; font-weight:700;">Total</td>
              <td style="padding:10px 0 0 0; font-size:14.5px; font-weight:700; text-align:right;">$${reserva.total}</td>
            </tr>` : ''}
          </table>
          <p style="margin:20px 0 20px 0; text-align:center;">
            <a href="${process.env.FRONTEND_URL}/reservas" style="display:inline-block; background-color:#111827; color:#ffffff; text-decoration:none; padding:11px 22px; border-radius:8px; font-size:14px; font-weight:600;">Ver en el panel (tab Libres)</a>
          </p>
          <p style="margin:0;">Recibes este correo porque tu cuenta está configurada para recibir avisos de nuevas reservas.</p>
        `,
      })

      await Promise.all(
        destinatarios.map((destinatario) =>
          Mail.send((message) => {
            message
              .from(`noreply@${process.env.MAILGUN_DOMAIN}`)
              .to(destinatario.email)
              .subject(`Nueva reserva libre #${reserva.id} — ${reserva.origen}`)
              .html(html)
          })
        )
      )
    } catch (error) {
      console.error('Error notifying admins of new reserva libre:', error)
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { nombre, apellido, telefono, fecha_inicio, fecha_fin, numero_personas, habitacion_descripcion, total, notas } =
      request.only([
        'nombre',
        'apellido',
        'telefono',
        'fecha_inicio',
        'fecha_fin',
        'numero_personas',
        'habitacion_descripcion',
        'total',
        'notas',
      ])

    try {
      const reserva = await ReservaLibre.findOrFail(params.id)
      reserva.merge({ nombre, apellido, telefono, fecha_inicio, fecha_fin, numero_personas, habitacion_descripcion, total, notas })
      await reserva.save()
      return response.json(reserva)
    } catch (error) {
      console.error('Error updating reserva libre:', error)
      return response.status(400).json({ message: 'Error updating reserva libre', error })
    }
  }

  // El hotel confirma que la reserva es real y ya la gestionó por fuera (o decide crear
  // manualmente una reserva/venta nativa a partir de esta información).
  public async validar({ params, response }: HttpContextContract) {
    try {
      const reserva = await ReservaLibre.findOrFail(params.id)
      reserva.estado = 'validada'
      await reserva.save()
      return response.json({ message: 'Reserva libre validada', reserva })
    } catch (error) {
      console.error('Error validating reserva libre:', error)
      return response.status(400).json({ message: 'Error validating reserva libre', error })
    }
  }

  public async descartar({ params, response }: HttpContextContract) {
    try {
      const reserva = await ReservaLibre.findOrFail(params.id)
      reserva.estado = 'descartada'
      await reserva.save()
      return response.json({ message: 'Reserva libre descartada', reserva })
    } catch (error) {
      console.error('Error discarding reserva libre:', error)
      return response.status(400).json({ message: 'Error discarding reserva libre', error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const reserva = await ReservaLibre.findOrFail(params.id)
      await reserva.delete()
      return response.status(204).json(null)
    } catch (error) {
      console.error('Error deleting reserva libre:', error)
      return response.status(400).json({ message: 'Error deleting reserva libre', error })
    }
  }
}
