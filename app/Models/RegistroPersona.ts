import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class RegistroPersona extends BaseModel {
  public static table = "registro_persona"

  @column({ isPrimary: true })
  public id: number

  @column()
  public nombre: string

  @column()
  public apellido: string

  @column()
  public tipo_documento: 'cedula' | 'pasaporte'

  @column()
  public numero_documento: string

  @column()
  public ciudadania: string

  @column()
  public procedencia: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
