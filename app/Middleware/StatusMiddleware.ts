import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class StatusMiddleware {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    const user = await auth.authenticate();

    if (user.status !== 'activo') {
      return response.status(403).json({ message: 'Tu cuenta ha sido deshabilitada' });
    }

    await next();
  }
}
