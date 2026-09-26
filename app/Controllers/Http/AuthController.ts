import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import Mail from '@ioc:Adonis/Addons/Mail'
import { renderEmailTemplate } from 'App/Helpers/EmailTemplate'

export default class AuthController {
  public async register ({ request, response }: HttpContextContract) {
    const registerSchema = schema.create({
      first_name: schema.string({ trim: true }, [rules.maxLength(80)]),
      last_name: schema.string({ trim: true }, [rules.maxLength(80)]),
      username: schema.string({ trim: true }, [
        rules.maxLength(80),
        rules.unique({ table: 'users', column: 'username' }),
      ]),
      email: schema.string({ trim: true }, [
        rules.email(),
        rules.maxLength(255),
        rules.unique({ table: 'users', column: 'email' }),
      ]),
      password: schema.string({}, [rules.minLength(8), rules.maxLength(180)]),
    })

    const payload = await request.validate({ schema: registerSchema })

    // El registro público nunca decide su propio rol/estado: se asigna el rol
    // menos privilegiado y queda inactivo hasta que un admin lo active
    // (evita que cualquiera se autoregistre como 'admin' mandando esos campos).
    const user = new User()
    user.firstName = payload.first_name
    user.lastName = payload.last_name
    user.username = payload.username
    user.email = payload.email
    user.password = payload.password
    user.role = 'empleado'
    user.status = 'inactivo'
    await user.save()

    const { email, firstName } = user

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

  public async login ({ request, auth, response }: HttpContextContract) {
    const loginSchema = schema.create({
      username: schema.string(),
      password: schema.string(),
    })
    const { username, password } = await request.validate({ schema: loginSchema })

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
