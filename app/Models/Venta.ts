import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import RegistroPersona from './RegistroPersona'
import Habitacion from './Habitacion'
import Precio from './Precio'

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

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
