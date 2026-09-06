import { DateTime } from 'luxon'
import { randomBytes } from 'crypto'
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

  @column()
  public reservasNativasActivas: boolean

  @column()
  public reservasLibresActivas: boolean

  // Secreto que autentica la ingesta externa de reservas libres (header `x-api-key`).
  // Nunca se expone por `serialize()`/JSON.stringify: solo se lee explícitamente en
  // ApiKeyMiddleware y se devuelve al admin a través de los endpoints dedicados.
  @column({ serializeAs: null })
  public reservasLibresApiKey: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  public static async actual(): Promise<Configuracion> {
    return this.firstOrCreate({ id: 1 }, { nombreHotel: 'HotelApp', porcentajeIva: 15 })
  }

  public static generarApiKey(): string {
    return randomBytes(32).toString('hex')
  }

  /** Devuelve la api key de reservas libres, generándola de una vez si nunca existió. */
  public async asegurarApiKey(): Promise<string> {
    if (!this.reservasLibresApiKey) {
      this.reservasLibresApiKey = Configuracion.generarApiKey()
      await this.save()
    }
    return this.reservasLibresApiKey
  }
}
