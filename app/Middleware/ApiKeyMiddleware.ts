import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { timingSafeEqual } from 'crypto'
import Configuracion from 'App/Models/Configuracion'

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // timingSafeEqual exige buffers del mismo largo; si difieren ya sabemos que no matchean,
  // pero igual comparamos contra sí mismo para no filtrar la longitud por temporización.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA)
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

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

    if (!provided || !safeCompare(provided, expected)) {
      return response.status(401).json({ message: 'API key inválida' })
    }

    await next()
  }
}
