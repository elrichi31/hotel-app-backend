import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class AuthController {
  public async register ({ request, response }: HttpContextContract) {
    const firstName = request.input('first_name')
    const lastName = request.input('last_name')
    const username = request.input('username')
    const email = request.input('email')
    const password = request.input('password')

    const user = new User()
    user.firstName = firstName
    user.lastName = lastName
    user.username = username
    user.email = email
    user.password = password
    await user.save()

    return response.created({ user })
  }

  public async login ({ request, auth, response }) {
    const username = request.input('username')
    const password = request.input('password')

    const user = await User.query().where('username', username).firstOrFail()

    if (!(await Hash.verify(user.password, password))) {
      return response.unauthorized('Invalid credentials')
    }

    const token = await auth.use('api').generate(user)
    return { token }
  }
}
