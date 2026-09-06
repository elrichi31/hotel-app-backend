import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

/** Reserva proveniente de un catálogo externo (página web fuera del sistema). No está
 * ligada a una habitación real ni a disponibilidad interna: es solo un registro para que
 * el hotel la revise y decida manualmente qué hacer con ella (nunca se convierte sola en Venta). */
export default class ReservaLibre extends BaseModel {
  public static table = 'reservas_libres'

  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public apellido: string | null

  @column()
  public email: string | null

  @column()
  public telefono: string | null

  @column()
  public fecha_inicio: Date

  @column()
  public fecha_fin: Date

  @column()
  public numero_personas: number

  @column()
  public habitacion_descripcion: string

  @column()
  public origen: string

  @column()
  public referencia_externa: string | null

  @column()
  public total: number | null

  @column()
  public notas: string | null

  @column()
  public estado: 'pendiente_revision' | 'validada' | 'descartada'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
