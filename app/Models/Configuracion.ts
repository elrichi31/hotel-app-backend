import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

/** Fila única (id=1) con la configuración general del hotel: usada tanto para mostrar la
 * marca en la app como para calcular el IVA de las facturas generadas automáticamente. */
export default class Configuracion extends BaseModel {
  public static table = 'configuracion'

  @column({ isPrimary: true })
  public id: number

  @column()
  public nombreHotel: string

  @column()
  public logoPath: string | null

  @column({
    prepare: (value: any) => parseFloat(value),
    serialize: (value: any) => parseFloat(value),
  })
  public porcentajeIva: number

  @column()
  public direccion: string | null

  @column()
  public telefono: string | null

  @column()
  public correo: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static async actual(): Promise<Configuracion> {
    return this.firstOrCreate({ id: 1 }, { nombreHotel: 'HotelApp', porcentajeIva: 15 })
  }
}
