import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Habitacion from 'App/Models/Habitacion'
import Precio from 'App/Models/Precio'
export default class Reserva extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public fecha_inicio: Date

  @column()
  public fecha_fin: Date

  @column()
  public numero_personas: number

  @column()
  public estado: 'pendiente' | 'confirmado' | 'cancelada'

  @column()
  public total: number

  @manyToMany(() => Habitacion, {
    pivotTable: 'reserva_habitacion_precios',
    pivotForeignKey: 'reserva_id',
    pivotRelatedForeignKey: 'habitacion_id',
  })
  public habitaciones: ManyToMany<typeof Habitacion>

  @manyToMany(() => Precio, {
    pivotTable: 'reserva_habitacion_precios',
    pivotForeignKey: 'reserva_id',
    pivotRelatedForeignKey: 'precio_id',
  })
  public precios: ManyToMany<typeof Precio>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
