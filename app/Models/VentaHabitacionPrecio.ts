import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Habitacion from './Habitacion'

export default class VentaHabitacionPrecio extends BaseModel {
    public static table = "venta_habitacion_precio"

  @column({ isPrimary: true })
  public id: number

  @column()
  public ventaId: number

  @column()
  public habitacionId: number

  @column()
  public precioId: number

  @manyToMany(() => Habitacion, {
    pivotTable: 'venta_habitacion_precio',
    pivotForeignKey: 'venta_id',
    pivotRelatedForeignKey: 'habitacion_id',
  })
  public habitaciones: ManyToMany<typeof Habitacion>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
