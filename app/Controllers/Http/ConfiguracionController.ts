import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Drive from '@ioc:Adonis/Core/Drive'
import Configuracion from 'App/Models/Configuracion'

function conLogoUrl(configuracion: Configuracion) {
  const data = configuracion.serialize()
  return {
    ...data,
    logo_url: configuracion.logoPath ? `/uploads/${configuracion.logoPath}` : null,
  }
}

export default class ConfiguracionController {
  public async show({ response }: HttpContextContract) {
    try {
      const configuracion = await Configuracion.actual()
      return response.json(conLogoUrl(configuracion))
    } catch (error) {
      console.error('Error fetching configuracion:', error)
      return response.status(500).json({ message: 'Error fetching configuracion', error })
    }
  }

  public async update({ request, response }: HttpContextContract) {
    const {
      nombre_hotel,
      porcentaje_iva,
      direccion,
      telefono,
      correo,
      reservas_nativas_activas,
      reservas_libres_activas,
    } = request.only([
      'nombre_hotel',
      'porcentaje_iva',
      'direccion',
      'telefono',
      'correo',
      'reservas_nativas_activas',
      'reservas_libres_activas',
    ])

    try {
      const configuracion = await Configuracion.actual()

      if (nombre_hotel !== undefined) configuracion.nombreHotel = nombre_hotel
      if (direccion !== undefined) configuracion.direccion = direccion
      if (telefono !== undefined) configuracion.telefono = telefono
      if (correo !== undefined) configuracion.correo = correo
      if (reservas_nativas_activas !== undefined) {
        configuracion.reservasNativasActivas = [true, 'true', '1', 1].includes(reservas_nativas_activas)
      }
      if (reservas_libres_activas !== undefined) {
        configuracion.reservasLibresActivas = [true, 'true', '1', 1].includes(reservas_libres_activas)
      }

      if (porcentaje_iva !== undefined) {
        const valor = Number(porcentaje_iva)
        if (Number.isNaN(valor) || valor < 0 || valor > 100) {
          return response.status(400).json({ message: 'El porcentaje de IVA debe estar entre 0 y 100' })
        }
        configuracion.porcentajeIva = valor
      }

      const logo = request.file('logo', {
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      })

      if (logo) {
        if (!logo.isValid) {
          return response.status(400).json({
            message: logo.errors.map((e) => e.message).join(', ') || 'Logo inválido',
          })
        }

        const nombreArchivo = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${logo.extname}`
        await logo.moveToDisk('logos', { name: nombreArchivo }, 'local')

        // Borrar el logo anterior para no acumular archivos huérfanos
        if (configuracion.logoPath) {
          const existeAnterior = await Drive.exists(configuracion.logoPath)
          if (existeAnterior) await Drive.delete(configuracion.logoPath)
        }

        configuracion.logoPath = `logos/${nombreArchivo}`
      }

      await configuracion.save()

      return response.json(conLogoUrl(configuracion))
    } catch (error) {
      console.error('Error updating configuracion:', error)
      return response.status(400).json({ message: 'Error updating configuracion', error })
    }
  }

  // Solo admin: revela la api key vigente de reservas libres (se genera de una vez si no existía)
  public async showApiKey({ response }: HttpContextContract) {
    try {
      const configuracion = await Configuracion.actual()
      const apiKey = await configuracion.asegurarApiKey()
      return response.json({ reservas_libres_api_key: apiKey })
    } catch (error) {
      console.error('Error fetching reservas libres api key:', error)
      return response.status(500).json({ message: 'Error fetching api key', error })
    }
  }

  // Solo admin: invalida la key anterior y genera una nueva. Cualquier integración externa
  // que use la key vieja empieza a recibir 401 hasta que se actualice con la nueva.
  public async regenerarApiKey({ response }: HttpContextContract) {
    try {
      const configuracion = await Configuracion.actual()
      configuracion.reservasLibresApiKey = Configuracion.generarApiKey()
      await configuracion.save()
      return response.json({ reservas_libres_api_key: configuracion.reservasLibresApiKey })
    } catch (error) {
      console.error('Error regenerating reservas libres api key:', error)
      return response.status(500).json({ message: 'Error regenerating api key', error })
    }
  }
}
