import Database from '@ioc:Adonis/Lucid/Database'

interface OpcionesDisponibilidad {
  /** Ignora esta reserva al buscar conflictos (para revalidar la reserva que se está aprobando/editando). */
  excludeReservaId?: number
  /** Ignora esta venta al buscar conflictos (para revalidar la venta que se está editando). */
  excludeVentaId?: number
}

/**
 * Devuelve el conjunto de ids (de `habitacionIds`) que NO están disponibles en el rango, en 2 queries.
 * Una habitación está ocupada si se solapa en fechas con:
 *  - alguna venta activa (cualquier estado salvo 'cancelada': una venta ya es un compromiso real), o
 *  - alguna reserva todavía viva (pendiente, confirmada o aprobada: una reserva cancelada no cuenta).
 *
 * Las reservas 'pendiente'/'confirmado' NO marcan la habitación como 'Ocupado' (eso solo ocurre
 * cuando el admin aprueba y se genera la Venta), así que la disponibilidad real hay que calcularla
 * contra estas dos tablas en lugar de mirar `habitacion.estado`.
 */
export async function habitacionesOcupadas(
  habitacionIds: Array<number | string>,
  fechaInicio: string | Date,
  fechaFin: string | Date,
  opciones: OpcionesDisponibilidad = {}
): Promise<Set<number>> {
  if (habitacionIds.length === 0) return new Set()

  const ventaQuery = Database.from('venta_habitacion_precio as vhp')
    .join('ventas as v', 'v.id', 'vhp.venta_id')
    .distinct('vhp.habitacion_id')
    .whereIn('vhp.habitacion_id', habitacionIds)
    .whereNot('v.estado', 'cancelada')
    .where('v.fecha_inicio', '<', fechaFin as any)
    .where('v.fecha_fin', '>', fechaInicio as any)

  if (opciones.excludeVentaId) {
    ventaQuery.whereNot('v.id', opciones.excludeVentaId)
  }

  const reservaQuery = Database.from('reserva_habitacion_precios as rhp')
    .join('reservas as r', 'r.id', 'rhp.reserva_id')
    .distinct('rhp.habitacion_id')
    .whereIn('rhp.habitacion_id', habitacionIds)
    .whereIn('r.estado', ['pendiente', 'confirmado', 'aprobada'])
    .where('r.fecha_inicio', '<', fechaFin as any)
    .where('r.fecha_fin', '>', fechaInicio as any)

  if (opciones.excludeReservaId) {
    reservaQuery.whereNot('r.id', opciones.excludeReservaId)
  }

  const [ventas, reservas] = await Promise.all([ventaQuery, reservaQuery])
  return new Set([...ventas, ...reservas].map((row) => Number(row.habitacion_id)))
}
