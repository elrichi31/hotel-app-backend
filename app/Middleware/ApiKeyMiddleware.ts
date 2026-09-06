import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Configuracion from 'App/Models/Configuracion'

/** Protege endpoints públicos de ingesta (ej. reservas libres desde una página externa)
 * con una API key generada y administrada desde Configuración, en vez del login de usuarios del panel. */
export default class ApiKeyMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const configuracion = await Configuracion.actual()
    const expected = configuracion.reservasLibresApiKey
    const provided = request.header('x-api-key', '')

    if (!expected) {
      return response.status(503).json({ message: 'Canal externo no configurado' })
    }

    if (provided !== expected) {
      return response.status(401).json({ message: 'API key inválida' })
    }

    await next()
  }
}
