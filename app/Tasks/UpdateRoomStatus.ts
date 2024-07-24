import { BaseTask, CronTimeV2 } from 'adonis5-scheduler/build/src/Scheduler/Task'
import Habitacion from 'App/Models/Habitacion'
import { DateTime } from 'luxon'

export default class UpdateRoomStatus extends BaseTask {
  public static get schedule() {
		// Use CronTimeV2 generator:
    return ('1 */3 * * *')
		// or just use return cron-style string (simple cron editor: crontab.guru)
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmp/adonis5-scheduler/locks/your-class-name`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    const now = DateTime.now()
    const habitaciones = await Habitacion.query()
      .where('estado', 'Ocupado')
      .where('fechaFinOcupacion', '<', now.toISO())

    for (const habitacion of habitaciones) {
      habitacion.estado = 'Libre'
      habitacion.fechaInicioOcupacion = null
      habitacion.fechaFinOcupacion = null
      await habitacion.save()
    }
    console.log('Updated room status')
  }
}
