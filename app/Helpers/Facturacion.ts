import { DateTime } from 'luxon'
import Configuracion from 'App/Models/Configuracion'

/** El IVA vive en la Configuración general (editable desde la UI), no en una constante fija. */
export async function obtenerPorcentajeIva(): Promise<number> {
  const configuracion = await Configuracion.actual()
  return Number(configuracion.porcentajeIva)
}

interface DesgloseFactura {
  base: number
  impuesto: number
  total: number
}

/** Calcula el IVA sobre (subtotal - descuento) y el total final a facturar. Usar cuando la tarifa NO incluye IVA. */
export function calcularDesglose(subtotal: number, descuento: number, porcentajeIva: number): DesgloseFactura {
  const base = Math.max(Math.round((subtotal - descuento) * 100) / 100, 0)
  const impuesto = Math.round(base * (porcentajeIva / 100) * 100) / 100
  const total = Math.round((base + impuesto) * 100) / 100
  return { base, impuesto, total }
}

/**
 * Extrae la base y el IVA de un monto que YA INCLUYE el impuesto (tarifas "todo incluido").
 * `montoConIva` debe venir neto de cualquier descuento: es lo que el huésped paga en total.
 */
export function extraerImpuestoIncluido(montoConIva: number, porcentajeIva: number): DesgloseFactura {
  const total = Math.max(Math.round(montoConIva * 100) / 100, 0)
  const base = Math.round((total / (1 + porcentajeIva / 100)) * 100) / 100
  const impuesto = Math.round((total - base) * 100) / 100
  return { base, impuesto, total }
}

/** Noches entre dos fechas/horas reales, redondeadas hacia arriba y con mínimo de 1 (estándar hotelero). */
export function calcularNoches(inicio: DateTime, fin: DateTime): number {
  const dias = fin.diff(inicio, 'days').days
  return Math.max(1, Math.ceil(dias))
}

interface ParametrosFacturaEstadia {
  /** Suma de las tarifas por noche de todas las habitaciones de la venta. */
  tarifaPorNoche: number
  noches: number
  /** Total de cargos adicionales (snacks, servicios) que se suman al alojamiento. */
  extras?: number
  descuento: number
  /** true si `tarifaPorNoche` ya trae el IVA por dentro (tarifa "todo incluido"). */
  incluyeIva: boolean
  porcentajeIva: number
}

interface FacturaEstadia {
  subtotal: number
  descuento: number
  impuesto: number
  total: number
}

/**
 * Arma el desglose de la factura de una estadía a partir de la tarifa nocturna y las noches
 * reales entre check-in y check-out (no las planeadas al reservar/vender), más cualquier
 * cargo adicional que se haya agregado al momento del check-out.
 */
export function calcularFacturaEstadia({
  tarifaPorNoche,
  noches,
  extras = 0,
  descuento,
  incluyeIva,
  porcentajeIva,
}: ParametrosFacturaEstadia): FacturaEstadia {
  const montoBruto = Math.round((tarifaPorNoche * noches + extras) * 100) / 100
  const descuentoAplicado = Math.min(Math.max(descuento, 0), montoBruto)

  if (incluyeIva) {
    const montoConDescuento = montoBruto - descuentoAplicado
    const { base, impuesto, total } = extraerImpuestoIncluido(montoConDescuento, porcentajeIva)
    return {
      subtotal: Math.round((base + descuentoAplicado) * 100) / 100,
      descuento: descuentoAplicado,
      impuesto,
      total,
    }
  }

  const { impuesto, total } = calcularDesglose(montoBruto, descuentoAplicado, porcentajeIva)
  return { subtotal: montoBruto, descuento: descuentoAplicado, impuesto, total }
}
