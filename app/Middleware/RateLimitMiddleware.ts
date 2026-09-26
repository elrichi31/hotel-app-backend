import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

interface Bucket {
  count: number
  resetAt: number
}

/** Límite simple en memoria por IP+ruta. Suficiente para un solo proceso/instancia;
 * si la app pasa a correr en múltiples instancias, esto debe moverse a Redis. */
const buckets = new Map<string, Bucket>()

/** Limpieza periódica para no acumular entradas de IPs que ya no vuelven a pegarle al endpoint. */
setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, 5 * 60 * 1000).unref()

export default class RateLimitMiddleware {
  public async handle(
    { request, response }: HttpContextContract,
    next: () => Promise<void>,
    args: string[]
  ) {
    const maxAttempts = Number(args[0] ?? 10)
    const windowSeconds = Number(args[1] ?? 60)

    const key = `${request.url()}:${request.ip()}`
    const now = Date.now()

    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowSeconds * 1000 }
      buckets.set(key, bucket)
    }

    bucket.count += 1

    if (bucket.count > maxAttempts) {
      return response.status(429).json({
        message: 'Demasiados intentos, inténtalo de nuevo más tarde',
      })
    }

    await next()
  }
}
