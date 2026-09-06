import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import Venta from 'App/Models/Venta'
import Habitacion from 'App/Models/Habitacion'
import VentaHabitacionPrecio from 'App/Models/VentaHabitacionPrecio'
import Factura from 'App/Models/Factura'
import { habitacionDisponible } from 'App/Helpers/Disponibilidad'
import { calcularFacturaEstadia, calcularNoches, obtenerPorcentajeIva } from 'App/Helpers/Facturacion'

export default class VentaController {
  public async index({ response }: HttpContextContract) {
    try {
      const ventas = await Venta.query()
        .preload('personas')
        .preload('facturas')
        .preload('usuario')
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
        .preload('usuario')
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

  public async store({ request, auth, response }: HttpContextContract) {
    const { personas, habitaciones, precios, fecha_inicio, fecha_fin, descuento, subtotal, total } = request.only(['personas', 'habitaciones', 'precios', 'fecha_inicio', 'fecha_fin', 'descuento', 'subtotal', 'total'])

    try {
      // Verificar disponibilidad antes de vender: evita el doble-booking entre el
      // mostrador y las reservas online (pendientes, confirmadas o aprobadas)
      for (const habitacionId of habitaciones) {
        const disponible = await habitacionDisponible(habitacionId, fecha_inicio, fecha_fin)
        if (!disponible) {
          const habitacion = await Habitacion.find(habitacionId)
          return response.status(409).json({
            message: `La habitación ${habitacion?.numero ?? habitacionId} no está disponible para esas fechas`,
          })
        }
      }

      // Registra quién creó la venta, para poder mostrarlo luego en el listado
      const usuario = await auth.authenticate()

      // Crear la venta
      const venta = await Venta.create({
        fechaInicio: fecha_inicio,
        fechaFin: fecha_fin,
        descuento,
        subtotal,
        total,
        usuarioId: usuario.id,
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

      // Verificar disponibilidad de las nuevas habitaciones (ignorando el hold de esta misma venta)
      for (const habitacionId of habitaciones) {
        const disponible = await habitacionDisponible(habitacionId, fecha_inicio, fecha_fin, {
          excludeVentaId: venta.id,
        })
        if (!disponible) {
          const habitacion = await Habitacion.find(habitacionId)
          return response.status(409).json({
            message: `La habitación ${habitacion?.numero ?? habitacionId} no está disponible para esas fechas`,
          })
        }
      }

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

  // Registrar la llegada del huésped: la venta pasa de 'reservado' a 'check_in'
  public async checkIn({ params, response }: HttpContextContract) {
    try {
      const venta = await Venta.findOrFail(params.id)

      if (venta.estado !== 'reservado') {
        return response.status(400).json({
          message: `No se puede hacer check-in de una venta en estado '${venta.estado}'`,
        })
      }

      venta.estado = 'check_in'
      venta.fechaCheckin = DateTime.local()
      await venta.save()

      return response.json(venta)
    } catch (error) {
      console.error('Error checking in venta:', error)
      return response.status(400).json({ message: 'Error checking in venta', error })
    }
  }

  // Registrar la salida del huésped: la venta pasa a 'check_out' y sus habitaciones vuelven a estar disponibles
  public async checkOut({ params, request, response }: HttpContextContract) {
    const { incluye_iva, productos_adicionales } = request.only(['incluye_iva', 'productos_adicionales'])
    const extras: { descripcion: string; cantidad: number; precio_unitario: number }[] = Array.isArray(
      productos_adicionales
    )
      ? productos_adicionales.filter((p) => p?.descripcion && Number(p?.cantidad) > 0 && Number(p?.precio_unitario) >= 0)
      : []

    try {
      const venta = await Venta.findOrFail(params.id)

      if (venta.estado !== 'check_in') {
        return response.status(400).json({
          message: `No se puede hacer check-out de una venta en estado '${venta.estado}'`,
        })
      }

      const fechaCheckout = DateTime.local()
      venta.estado = 'check_out'
      venta.fechaCheckout = fechaCheckout
      await venta.save()

      // Liberar las habitaciones asociadas a esta venta
      await venta.load('habitaciones')
      for (const habitacion of venta.habitaciones) {
        habitacion.merge({
          estado: 'Libre',
          fechaInicioOcupacion: null,
          fechaFinOcupacion: null,
        })
        await habitacion.save()
      }

      // Generar automáticamente la factura de la estancia: al terminarla, ya no depende
      // de que alguien se acuerde de crearla a mano desde el módulo de Facturas. El monto se
      // recalcula con las noches REALES entre check-in y check-out (no las que se planearon al
      // vender), y respeta si el recepcionista cobra la tarifa con IVA incluido o no.
      await venta.load('personas')
      const huesped = venta.personas[0]

      const filasHabitacion = await Database.from('venta_habitacion_precio as vhp')
        .join('precios as p', 'p.id', 'vhp.precio_id')
        .join('habitacion as h', 'h.id', 'vhp.habitacion_id')
        .where('vhp.venta_id', venta.id)
        .select('h.numero', 'p.precio')
      const tarifaPorNoche = filasHabitacion.reduce((acc, fila) => acc + Number(fila.precio), 0)
      const extrasTotal = extras.reduce((acc, item) => acc + Number(item.cantidad) * Number(item.precio_unitario), 0)

      const noches = calcularNoches(venta.fechaCheckin ?? venta.fechaInicio, fechaCheckout)
      const porcentajeIva = await obtenerPorcentajeIva()

      const { subtotal, descuento, impuesto, total } = calcularFacturaEstadia({
        tarifaPorNoche,
        noches,
        extras: extrasTotal,
        descuento: Number(venta.descuento),
        incluyeIva: Boolean(incluye_iva),
        porcentajeIva,
      })

      const factura = await Factura.create({
        nombre: huesped?.nombre ?? 'Huésped',
        apellido: huesped?.apellido ?? `Venta #${venta.id}`,
        identificacion: huesped?.numero_documento ?? '',
        direccion: '',
        correo: '',
        fecha_emision: DateTime.local(),
        subtotal,
        descuento,
        porcentajeIva,
        impuesto,
        total,
        forma_pago: 'Pendiente de registro',
        estado: 'emitido',
        ventaId: venta.id,
      })

      // Detalle de la factura: una línea por habitación (con las noches reales) y una por cada cargo adicional
      for (const fila of filasHabitacion) {
        await factura.related('productos').create({
          cantidad: noches,
          descripcion: `Habitación ${fila.numero} (${noches} noche${noches > 1 ? 's' : ''})`,
          precio_unitario: Number(fila.precio),
        })
      }
      for (const item of extras) {
        await factura.related('productos').create({
          cantidad: Number(item.cantidad),
          descripcion: String(item.descripcion),
          precio_unitario: Number(item.precio_unitario),
        })
      }
      await factura.load('productos')

      return response.json({ venta, factura, noches })
    } catch (error) {
      console.error('Error checking out venta:', error)
      return response.status(400).json({ message: 'Error checking out venta', error })
    }
  }
}
