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
    // Update directo: no pasa por save(), así que updated_at se escribe a mano.
    const [liberadas] = await Habitacion.query()
      .where('estado', 'Ocupado')
      .where('fecha_fin_ocupacion', '<', now)
      .update({
        estado: 'Libre',
        fecha_inicio_ocupacion: null,
        fecha_fin_ocupacion: null,
        updated_at: now,
      })

    console.log(`Updated room status at ${DateTime.now().toISO()}: ${liberadas} habitaciones liberadas`)
  }
}
