import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class RoleMiddleware {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>, roles: string[]) {
    const user = await auth.authenticate();
    
    if (!roles.includes(user.role)) {
      return response.unauthorized({ message: 'No tienes permiso para acceder a esta sección' });
    }

    await next();
  }
}
