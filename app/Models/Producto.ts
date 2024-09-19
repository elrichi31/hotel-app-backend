import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Factura from 'App/Models/Factura'

export default class Producto extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public cantidad: number

  @column()
  public descripcion: string

  @column({
    serializeAs: 'precio_unitario',
    prepare: (value: any) => parseFloat(value),
    serialize: (value: any) => parseFloat(value),
  })
  public precio_unitario: number

  @column()
  public facturaId: number

  @belongsTo(() => Factura)
  public factura: BelongsTo<typeof Factura>

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public created_at: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updated_at: DateTime
}
