import { DateTime } from 'luxon'
import { BaseModel, column, BelongsTo, belongsTo } from '@ioc:Adonis/Lucid/Orm'
import Venta from 'App/Models/Venta'

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

  @column()
  public numero_factura: string

  @column.dateTime()
  public fecha_emision: DateTime

  @column()
  public descripcion: string

  @column()
  public cantidad: number

  @column()
  public precio_unitario: number

  @column()
  public subtotal: number

  @column()
  public descuento: number

  @column()
  public iva: number

  @column()
  public otros_impuestos: number

  @column()
  public total: number

  @column()
  public forma_pago: string

  @column()
  public observaciones?: string

  @column()
  public ventaId: number
  
  @belongsTo(() => Venta)
  public venta: BelongsTo<typeof Venta>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}


