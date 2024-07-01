import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Habitacion extends BaseModel {
  public static table = 'habitacion'

  @column({ isPrimary: true })
  public id: number

  @column()
  public numero: string

  @column()
  public tipo: string

  @column()
  public precio: number

  @column()
  public estado: string

  @column()
  public descripcion: string

  @column()
  public numero_camas: number

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
