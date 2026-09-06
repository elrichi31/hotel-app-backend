import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Mail from '@ioc:Adonis/Addons/Mail'
import { renderEmailTemplate } from 'App/Helpers/EmailTemplate'

export default class AuthController {
  public async register ({ request, response }: HttpContextContract) {
    const firstName = request.input('first_name')
    const lastName = request.input('last_name')
    const username = request.input('username')
    const email = request.input('email')
    const password = request.input('password')
    const role = request.input('role')
    const status = request.input('status')

    const user = new User()
    user.firstName = firstName
    user.lastName = lastName
    user.username = username
    user.email = email
    user.password = password
    user.role = role
    user.status = status
    await user.save()

    const html = await renderEmailTemplate({
      title: 'Bienvenido',
      preheader: 'Tu cuenta ha sido creada exitosamente.',
      bodyHtml: `
        <h2 style="margin:0 0 12px 0; font-size:19px;">¡Bienvenido!</h2>
        <p style="margin:0 0 12px 0;">Hola ${firstName},</p>
        <p style="margin:0 0 12px 0;">Gracias por unirte a nuestra comunidad. Estamos encantados de tenerte a bordo.</p>
        <p style="margin:24px 0 0 0;">Saludos,<br>El equipo de soporte</p>
      `,
    })

    await Mail.send((message) => {
      message
      .from(`noreply@${process.env.MAILGUN_DOMAIN}`)
      .to(email)
        .subject('Welcome Onboard!')
        .html(html)
    })

    return response.created({ user })
  }

  public async login ({ request, auth, response }) {
    const username = request.input('username')
    const password = request.input('password')

    const user = await User.query().where('username', username).first()

    if (!user) {
      return response.status(401).json({ message: 'Invalid credentials' })
    }

    if (user.status !== 'activo') {
      return response.status(401).json({ message: 'Tu cuenta ha sido deshabilitada' })
    }

    if (!(await Hash.verify(user.password, password))) {
      return response.status(401).json({ message: 'Invalid credentials' })
    }

    const token = await auth.use('api').generate(user)
    return { token, user }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.use('api').revoke()
    await auth.use('api').logout()
    return response.json({ message: 'Successfully logged out' })
  }
}
