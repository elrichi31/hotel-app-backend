import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany, ManyToMany, manyToMany } from '@ioc:Adonis/Lucid/Orm'
import Precio from './Precio'
import Reserva from './Reserva'
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

  @column()
  public capacidad: number

  @column()
  public wifi: boolean

  @column()
  public tipoCama: string

  @column()
  public tvCable: boolean

  @column()
  public mesaTrabajo: boolean

  @column()
  public banoPrivado: boolean

  @column({
    prepare: (value: string[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | string[] | null) => {
      if (!value) return []
      return typeof value === 'string' ? JSON.parse(value) : value
    },
  })
  public amenidades: string[]

  @column.dateTime()
  public fechaInicioOcupacion: DateTime | null

  @column.dateTime()
  public fechaFinOcupacion: DateTime | null

  @hasMany(() => Precio)
  public precios: HasMany<typeof Precio>

  @manyToMany(() => Reserva, {
    pivotTable: 'reserva_habitacion_precios',
    pivotForeignKey: 'habitacion_id',
    pivotRelatedForeignKey: 'reserva_id',
  })
  public reservas: ManyToMany<typeof Reserva>;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
