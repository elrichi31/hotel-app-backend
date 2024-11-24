import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Venta from 'App/Models/Venta'
import Producto from 'App/Models/Producto'

export default class Factura extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public identificacion: string

  @column()
  public direccion: string

  @column()
  public telefono?: string

  @column()
  public correo: string

  @column.dateTime()
  public fecha_emision: DateTime

  @column({
    serializeAs: 'subtotal',
    prepare: (value: any) => parseFloat(value),
    serialize: (value: any) => parseFloat(value),
  })
  public subtotal: number

  @column({
    serializeAs: 'descuento',
    prepare: (value: any) => parseFloat(value),
    serialize: (value: any) => parseFloat(value),
  })
  public descuento: number

  @column({
    serializeAs: 'total',
    prepare: (value: any) => parseFloat(value),
    serialize: (value: any) => parseFloat(value),
  })
  public total: number

  @column()
  public forma_pago: string

  @column()
  public observaciones?: string

  @column()
  public estado: 'guardado' | 'emitido' | 'anulado'

  @column()
  public ventaId: number

  @belongsTo(() => Venta)
  public venta: BelongsTo<typeof Venta>

  @hasMany(() => Producto)
  public productos: HasMany<typeof Producto>


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}


