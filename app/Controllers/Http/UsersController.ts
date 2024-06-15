import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';

export default class UsersController {
  public async show({ auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();
      return response.json(user);
    } catch (error) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
  }
}
