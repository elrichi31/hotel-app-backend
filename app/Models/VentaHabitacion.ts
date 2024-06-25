import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class VentaHabitacion extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public ventaId: number

  @column()
  public habitacionId: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
