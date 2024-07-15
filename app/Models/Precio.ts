import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Habitacion from './Habitacion'

export default class Precio extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public habitacionId: number

  @column()
  public numeroPersonas: number

  @column()
  public precio: number

  @belongsTo(() => Habitacion)
  public habitacion: BelongsTo<typeof Habitacion>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
