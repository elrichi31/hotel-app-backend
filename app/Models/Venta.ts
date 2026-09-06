import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany, manyToMany, ManyToMany, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import RegistroPersona from './RegistroPersona'
import Habitacion from './Habitacion'
import Precio from './Precio'
import Factura from './Factura'
import User from './User'

export default class Venta extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime()
  public fechaInicio: DateTime

  @column.dateTime()
  public fechaFin: DateTime

  @column()
  public descuento: number

  @column()
  public subtotal: number

  @column()
  public total: number

  @column()
  public estado: 'reservado' | 'check_in' | 'check_out' | 'cancelada'

  @column.dateTime()
  public fechaCheckin: DateTime | null

  @column.dateTime()
  public fechaCheckout: DateTime | null

  @column()
  public usuarioId: number | null

  @belongsTo(() => User, { foreignKey: 'usuarioId' })
  public usuario: BelongsTo<typeof User>

  @manyToMany(() => RegistroPersona, {
    pivotTable: 'persona_venta',
    pivotForeignKey: 'venta_id',
    pivotRelatedForeignKey: 'persona_id',
  })
  public personas: ManyToMany<typeof RegistroPersona>

  @manyToMany(() => Habitacion, {
    pivotTable: 'venta_habitacion_precio',
    pivotForeignKey: 'venta_id',
    pivotRelatedForeignKey: 'habitacion_id',
  })
  public habitaciones: ManyToMany<typeof Habitacion> 

  @manyToMany(() => Precio, {
    pivotTable: 'venta_habitacion_precio',
    pivotForeignKey: 'venta_id',
    pivotRelatedForeignKey: 'precio_id',
  })
  public precios: ManyToMany<typeof Precio>

  @hasMany(() => Factura)
  public facturas: HasMany<typeof Factura>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
