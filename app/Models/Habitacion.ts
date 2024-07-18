import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Precio from './Precio'
export default class Habitacion extends BaseModel {
  public static table = "habitacion"

  @column({ isPrimary: true })
  public id: number

  @column()
  public numero: string

  @column()
  public tipo: string

  @column()
  public estado: string

  @column()
  public descripcion: string

  @column()
  public numeroCamas: number

  @column.dateTime()
  public fechaInicioOcupacion: DateTime | null

  @column.dateTime()
  public fechaFinOcupacion: DateTime | null

  @hasMany(() => Precio)
  public precios: HasMany<typeof Precio>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
