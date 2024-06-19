import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public email: string

  @column()
  public telefono: string

  @column()
  public direccion: string

  @column()
  public identificacion: number

  @column.dateTime({ autoCreate: true })
  public fechaRegistro: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
