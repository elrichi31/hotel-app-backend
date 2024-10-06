import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Habitacion from 'App/Models/Habitacion'
import Precio from 'App/Models/Precio'
import Reserva from 'App/Models/Reserva'

export default class ReservaHabitacionPrecio extends BaseModel {
    public static table = "reserva_habitacion_precios"

    @column({ isPrimary: true })
    public id: number

    @column()
    public reservaId: number

    @column()
    public habitacionId: number

    @column()
    public precioId: number

    @belongsTo(() => Reserva)
    public reserva: BelongsTo<typeof Reserva>

    @belongsTo(() => Habitacion)
    public habitacion: BelongsTo<typeof Habitacion>

    @belongsTo(() => Precio)
    public precio: BelongsTo<typeof Precio>
}
