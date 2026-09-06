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
    const { nombre_hotel, porcentaje_iva, direccion, telefono, correo } = request.only([
      'nombre_hotel',
      'porcentaje_iva',
      'direccion',
      'telefono',
      'correo',
    ])

    try {
      const configuracion = await Configuracion.actual()

      if (nombre_hotel !== undefined) configuracion.nombreHotel = nombre_hotel
      if (direccion !== undefined) configuracion.direccion = direccion
      if (telefono !== undefined) configuracion.telefono = telefono
      if (correo !== undefined) configuracion.correo = correo

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
}
