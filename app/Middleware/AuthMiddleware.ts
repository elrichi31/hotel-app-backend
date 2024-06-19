import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class AuthMiddleware {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    try {
      await auth.authenticate();
      await next();
    } catch (error) {
      console.log(error);
      return response.unauthorized({ message: 'Unauthorized' });
    }
  }
}
