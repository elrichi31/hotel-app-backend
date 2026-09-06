import Database from '@ioc:Adonis/Lucid/Database'

interface OpcionesDisponibilidad {
  /** Ignora esta reserva al buscar conflictos (para revalidar la reserva que se está aprobando/editando). */
  excludeReservaId?: number
  /** Ignora esta venta al buscar conflictos (para revalidar la venta que se está editando). */
  excludeVentaId?: number
}

/**
 * Una habitación está disponible si no se solapa en fechas con:
 *  - ninguna venta activa (cualquier estado salvo 'cancelada': una venta ya es un compromiso real), o
 *  - ninguna reserva todavía viva (pendiente, confirmada o aprobada: una reserva cancelada no cuenta).
 *
 * Las reservas 'pendiente'/'confirmado' NO marcan la habitación como 'Ocupado' (eso solo ocurre
 * cuando el admin aprueba y se genera la Venta), así que la disponibilidad real hay que calcularla
 * contra estas dos tablas en lugar de mirar `habitacion.estado`.
 */
export async function habitacionDisponible(
  habitacionId: number,
  fechaInicio: string | Date,
  fechaFin: string | Date,
  opciones: OpcionesDisponibilidad = {}
): Promise<boolean> {
  const ventaQuery = Database.from('venta_habitacion_precio as vhp')
    .join('ventas as v', 'v.id', 'vhp.venta_id')
    .where('vhp.habitacion_id', habitacionId)
    .whereNot('v.estado', 'cancelada')
    .where('v.fecha_inicio', '<', fechaFin as any)
    .where('v.fecha_fin', '>', fechaInicio as any)

  if (opciones.excludeVentaId) {
    ventaQuery.whereNot('v.id', opciones.excludeVentaId)
  }

  const reservaQuery = Database.from('reserva_habitacion_precios as rhp')
    .join('reservas as r', 'r.id', 'rhp.reserva_id')
    .where('rhp.habitacion_id', habitacionId)
    .whereIn('r.estado', ['pendiente', 'confirmado', 'aprobada'])
    .where('r.fecha_inicio', '<', fechaFin as any)
    .where('r.fecha_fin', '>', fechaInicio as any)

  if (opciones.excludeReservaId) {
    reservaQuery.whereNot('r.id', opciones.excludeReservaId)
  }

  const [ventaConflicto, reservaConflicto] = await Promise.all([
    ventaQuery.count('* as total').first(),
    reservaQuery.count('* as total').first(),
  ])

  return Number(ventaConflicto?.total ?? 0) === 0 && Number(reservaConflicto?.total ?? 0) === 0
}
