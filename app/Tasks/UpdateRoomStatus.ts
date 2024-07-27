import { BaseTask } from 'adonis5-scheduler/build/src/Scheduler/Task'
import Habitacion from 'App/Models/Habitacion'
import { DateTime } from 'luxon'

export default class UpdateRoomStatus extends BaseTask {
  public static get schedule() {
    return ('0 */3 * * *')
  }
  public static get useLock() {
    return false
  }

  public async handle() {
    const now = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')
    const habitaciones = await Habitacion.query()
      .where('estado', 'Ocupado')
      .where('fechaFinOcupacion', '<', now)

    for (const habitacion of habitaciones) {
      console.log(`Updating room status for room ---------------> ${habitacion.numero} ---- ${habitacion.fechaFinOcupacion} -----> ${now}`)
      habitacion.estado = 'Libre'
      habitacion.fechaInicioOcupacion = null
      habitacion.fechaFinOcupacion = null
      await habitacion.save()
    }

    const updateTime = DateTime.now().toISO()
    console.log(`Updated room status at ${updateTime}`)
  }
}
