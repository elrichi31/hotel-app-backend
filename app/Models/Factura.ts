import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Venta from './Venta'

export default class Factura extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public tipo_documento: string

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public direccion: string

  @column()
  public telefono: string

  @column()
  public correo: string

  @column()
  public venta_id: number

  @belongsTo(() => Venta)
  public venta: BelongsTo<typeof Venta>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
