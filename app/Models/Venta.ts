import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import VentaHabitacion from './VentaHabitacion'

export default class Venta extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public idCliente: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public cedula: string

  @column()
  public direccion: string

  @column()
  public telefono: string

  @column()
  public total: number

  @column()
  public numeroPersonas: number

  @column()
  public metodoPago: string

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @hasMany(() => VentaHabitacion)
  public habitaciones: HasMany<typeof VentaHabitacion>
}
