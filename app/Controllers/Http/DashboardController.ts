import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import Venta from 'App/Models/Venta'
import Factura from 'App/Models/Factura'
import Habitacion from 'App/Models/Habitacion'
import Reserva from 'App/Models/Reserva'
import RegistroPersona from 'App/Models/RegistroPersona'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default class DashboardController {
  /**
   * Agrega ventas, facturas, reservas y habitaciones en un solo payload para
   * el panel de rendimiento. Todo se calcula en JS a partir de lo que ya
   * cargan los otros controllers: el volumen de un hotel demo no justifica
   * SQL de agregación específico por motor.
   */
  public async stats({ response }: HttpContextContract) {
    try {
      const now = DateTime.now()
      const startOfMonth = now.startOf('month')
      const startOfPrevMonth = startOfMonth.minus({ months: 1 })

      const [ventas, facturas, habitaciones, reservas, personas] = await Promise.all([
        Venta.query().preload('precios', (q) => q.preload('habitacion')),
        Factura.query(),
        Habitacion.query().preload('precios'),
        Reserva.query(),
        RegistroPersona.query(),
      ])

      /* --------------------------- Ingresos por día -------------------------- */
      const ventasDelMes = ventas.filter((v) => v.createdAt >= startOfMonth)
      const ventasMesAnterior = ventas.filter(
        (v) => v.createdAt >= startOfPrevMonth && v.createdAt < startOfMonth
      )

      const daysInMonth = now.daysInMonth ?? 30
      const daily = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const actualDay = ventasDelMes
          .filter((v) => v.createdAt.day === day && v.createdAt <= now)
          .reduce((s, v) => s + Number(v.total), 0)
        const anteriorDay = ventasMesAnterior
          .filter((v) => v.createdAt.day === day)
          .reduce((s, v) => s + Number(v.total), 0)
        return {
          day,
          actual: day <= now.day ? actualDay : null,
          anterior: anteriorDay,
        }
      })

      const totalRevenue = ventasDelMes.reduce((s, v) => s + Number(v.total), 0)
      const prevRevenue = ventasMesAnterior.reduce((s, v) => s + Number(v.total), 0)
      const revenueDelta = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

      /* ------------------------- Ingresos por tipo --------------------------- */
      const porTipo = new Map<string, { revenue: number; nights: number }>()
      for (const v of ventas) {
        const nights = Math.max(
          1,
          Math.round(v.fechaFin.diff(v.fechaInicio, 'days').days || 1)
        )
        for (const precio of v.precios) {
          const tipo = precio.habitacion?.tipo ?? 'Otro'
          const actual = porTipo.get(tipo) ?? { revenue: 0, nights: 0 }
          actual.revenue += Number(precio.precio) * nights
          actual.nights += nights
          porTipo.set(tipo, actual)
        }
      }
      const roomTypes = Array.from(porTipo.entries())
        .map(([name, v]) => ({ name, revenue: Math.round(v.revenue), nights: v.nights }))
        .sort((a, b) => b.revenue - a.revenue)

      /* ---------------------------- Patrón semanal ---------------------------- */
      const weekdayCounts = new Array(7).fill(0)
      for (const v of ventas) {
        weekdayCounts[v.fechaInicio.weekday % 7] += 1
      }
      const weekday = WEEKDAYS.map((day, i) => ({ day, checkins: weekdayCounts[i] }))

      /* ------------------------------ Ocupación -------------------------------- */
      const ocupadas = habitaciones.filter((h) => h.estado === 'Ocupado').length
      const libres = habitaciones.length - ocupadas

      /* ---------------------------- Habitaciones top --------------------------- */
      const porHabitacion = new Map<number, { numero: string; tipo: string; revenue: number }>()
      for (const v of ventas) {
        const nights = Math.max(1, Math.round(v.fechaFin.diff(v.fechaInicio, 'days').days || 1))
        for (const precio of v.precios) {
          const hab = precio.habitacion
          if (!hab) continue
          const actual = porHabitacion.get(hab.id) ?? { numero: hab.numero, tipo: hab.tipo, revenue: 0 }
          actual.revenue += Number(precio.precio) * nights
          porHabitacion.set(hab.id, actual)
        }
      }
      const topRooms = Array.from(porHabitacion.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)
        .map((r) => ({ ...r, revenue: Math.round(r.revenue) }))

      const porHabitacionNoches = new Map<number, { numero: string; tipo: string; nights: number }>()
      for (const v of ventas) {
        const nights = Math.max(1, Math.round(v.fechaFin.diff(v.fechaInicio, 'days').days || 1))
        for (const precio of v.precios) {
          const hab = precio.habitacion
          if (!hab) continue
          const actual = porHabitacionNoches.get(hab.id) ?? { numero: hab.numero, tipo: hab.tipo, nights: 0 }
          actual.nights += nights
          porHabitacionNoches.set(hab.id, actual)
        }
      }
      const topRoomsByNights = Array.from(porHabitacionNoches.values())
        .sort((a, b) => b.nights - a.nights)
        .slice(0, 5)

      /* ------------------------------ Facturas --------------------------------- */
      const facturasDelMes = facturas.filter((f) => f.createdAt >= startOfMonth)
      const facturasMesAnterior = facturas.filter(
        (f) => f.createdAt >= startOfPrevMonth && f.createdAt < startOfMonth
      )
      const facturasRevenue = facturasDelMes
        .filter((f) => f.estado === 'emitido')
        .reduce((s, f) => s + Number(f.total), 0)
      const facturasPrevRevenue = facturasMesAnterior
        .filter((f) => f.estado === 'emitido')
        .reduce((s, f) => s + Number(f.total), 0)
      const facturasDelta =
        facturasPrevRevenue > 0
          ? ((facturasRevenue - facturasPrevRevenue) / facturasPrevRevenue) * 100
          : 0

      const facturasPorEstado = [
        { name: 'Emitido', value: facturas.filter((f) => f.estado === 'emitido').length },
        { name: 'Guardado', value: facturas.filter((f) => f.estado === 'guardado').length },
        { name: 'Anulado', value: facturas.filter((f) => f.estado === 'anulado').length },
      ]

      /* ------------------------------ Reservas ---------------------------------- */
      const reservasDelMes = reservas.filter((r) => r.createdAt >= startOfMonth)
      const reservasMesAnterior = reservas.filter(
        (r) => r.createdAt >= startOfPrevMonth && r.createdAt < startOfMonth
      )
      const reservasDelta =
        reservasMesAnterior.length > 0
          ? ((reservasDelMes.length - reservasMesAnterior.length) / reservasMesAnterior.length) * 100
          : 0

      /* ------------------------------ Huéspedes ---------------------------------- */
      const personasDelMes = personas.filter((p) => p.createdAt >= startOfMonth)
      const personasMesAnterior = personas.filter(
        (p) => p.createdAt >= startOfPrevMonth && p.createdAt < startOfMonth
      )
      const personasDelta =
        personasMesAnterior.length > 0
          ? ((personasDelMes.length - personasMesAnterior.length) / personasMesAnterior.length) * 100
          : 0

      const porProcedencia = new Map<string, number>()
      for (const p of personas) {
        const key = p.procedencia || 'Sin registrar'
        porProcedencia.set(key, (porProcedencia.get(key) ?? 0) + 1)
      }
      const totalPersonas = personas.length || 1
      const procedenciaTop = Array.from(porProcedencia.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, pct: Math.round((count / totalPersonas) * 100) }))

      return response.json({
        revenue: { total: totalRevenue, delta: Math.round(revenueDelta), daily },
        orders: { total: ventasDelMes.length, delta: 0 },
        facturas: { total: facturasRevenue, delta: Math.round(facturasDelta) },
        reservas: { total: reservasDelMes.length, delta: Math.round(reservasDelta) },
        roomTypes,
        weekday,
        occupancy: { ocupadas, libres, total: habitaciones.length },
        topRooms,
        topRoomsByNights,
        facturasPorEstado,
        huespedes: {
          total: personas.length,
          delta: Math.round(personasDelta),
          porProcedencia: procedenciaTop,
        },
      })
    } catch (error) {
      console.error('Error building dashboard stats:', error)
      return response.status(500).json({ message: 'Error building dashboard stats', error })
    }
  }
}
