import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import User from 'App/Models/User';
import Hash from '@ioc:Adonis/Core/Hash';
import PasswordReset from 'App/Models/PasswordReset';
import { DateTime } from 'luxon';
import Mail from '@ioc:Adonis/Addons/Mail'
import { v4 as uuidv4 } from 'uuid'

export default class UsersController {
  // Método para mostrar el usuario autenticado
  public async show({ auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();
      return response.json(user);
    } catch (error) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
  }

  // Método para mostrar todos los usuarios
  public async index({ auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();

      if (user.role !== 'admin') {
        return response.status(403).json({ message: 'Access denied: Admins only' });
      }

      // Obtener todos los usuarios excluyendo el campo 'password'
      const users = await User.query().select('id', 'first_name', 'last_name', 'username', 'email', 'role', 'status');
      return response.json(users);
    } catch (error) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
  }

  // Método para mostrar un usuario específico
  public async getUser({ auth, params, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();

      if (user.role !== 'admin') {
        return response.status(403).json({ message: 'Access denied: Admins only' });
      }

      const userId = params.id;
      const foundUser = await User.query().where('id', userId).select('id', 'first_name', 'last_name', 'username', 'email', 'role', 'status').first();

      if (!foundUser) {
        return response.status(404).json({ message: 'User not found' });
      }

      return response.json(foundUser);
    } catch (error) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
  }

  // Método para crear un nuevo usuario
  public async create({ request, auth, response }: HttpContextContract) {
    try {
      // Autenticación del usuario actual y verificación del rol de administrador
      const user = await auth.authenticate();

      if (user.role !== 'admin') {
        return response.status(403).json({ message: 'Access denied: Admins only' });
      }

      // Obtención de los datos del nuevo usuario
      const { first_name, last_name, username, email, role, status } = request.only([
        'first_name',
        'last_name',
        'username',
        'email',
        'role',
        'status',
      ]);

      // Generar una contraseña temporal
      const temporaryPassword = uuidv4().slice(0, 8); // Generar una contraseña temporal de 8 caracteres

      // Crear el nuevo usuario
      const newUser = new User();
      newUser.firstName = first_name;
      newUser.lastName = last_name;
      newUser.username = username;
      newUser.email = email;
      newUser.password = temporaryPassword;
      newUser.role = role;
      newUser.status = status;

      // Guardar el usuario en la base de datos
      await newUser.save();

      // Preparar la información del correo
      const emailContent = `
        <h1>Bienvenido a la Plataforma</h1>
        <p>Hola ${first_name} ${last_name},</p>
        <p>Se ha creado una cuenta para ti en nuestra plataforma. A continuación, encontrarás tus credenciales de acceso:</p>
        <ul>
          <li><strong>Nombre de usuario:</strong> ${username}</li>
          <li><strong>Contraseña temporal:</strong> ${temporaryPassword}</li>
        </ul>
        <p>Por razones de seguridad, te recomendamos que cambies tu contraseña después de iniciar sesión. Puedes hacerlo desde la sección de inicio de sesion en olvide mi contraseña e ingresa tu correo</p>
        <p>Si tienes alguna duda, no dudes en contactarnos.</p>
        <p>Saludos,<br>El equipo de soporte</p>
      `;

      // Log de la información del correo
      console.log('Email a enviar:', {
        to: email,
        subject: 'Credenciales de acceso a la plataforma',
        html: emailContent,
      });

      // Enviar las credenciales por correo electrónico al usuario
      // await Mail.send((message) => {
      //   message
      //     .from('no-reply@example.com')
      //     .to(email)
      //     .subject('Credenciales de acceso a la plataforma')
      //     .html(emailContent);
      // });

      // Responder con el usuario creado (excluyendo la contraseña)
      return response.status(201).json({
        id: newUser.id,
        first_name: newUser.firstName,
        last_name: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      });
    } catch (error) {
      return response.status(400).json({ message: 'Error creating user', error });
    }
  }

  // Método para actualizar un usuario
  public async update({ request, params, auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();

      if (user.role !== 'admin') {
        return response.status(403).json({ message: 'Access denied: Admins only' });
      }

      const userId = params.id;
      const foundUser = await User.find(userId);

      if (!foundUser) {
        return response.status(404).json({ message: 'User not found' });
      }

      const { first_name, last_name, username, email, password, role, status } = request.only([
        'first_name',
        'last_name',
        'username',
        'email',
        'password',
        'role',
        'status'
      ]);

      if (first_name) foundUser.firstName = first_name;
      if (last_name) foundUser.lastName = last_name;
      if (username) foundUser.username = username;
      if (email) foundUser.email = email;
      if (password) foundUser.password = await Hash.make(password);
      if (role) foundUser.role = role;
      if (status) foundUser.status = status;

      await foundUser.save();
      return response.json(foundUser);
    } catch (error) {
      return response.status(400).json({ message: 'Error updating user', error });
    }
  }

  // Método para eliminar un usuario
  public async delete({ params, auth, response }: HttpContextContract) {
    try {
      const user = await auth.authenticate();

      if (user.role !== 'admin') {
        return response.status(403).json({ message: 'Access denied: Admins only' });
      }

      const userId = params.id;
      const foundUser = await User.find(userId);

      if (!foundUser) {
        return response.status(404).json({ message: 'User not found' });
      }

      await foundUser.delete();
      return response.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return response.status(400).json({ message: 'Error deleting user', error });
    }
  }

  public async requestPasswordReset({ request, response }: HttpContextContract) {
    const email = request.input('email')
    const user = await User.findBy('email', email)

    if (!user) {
      return response.status(200).json({ message: 'Correo enviado' })
    }

    // Generar un token único para el reseteo de contraseña
    const token = uuidv4()
    const expiresAt = DateTime.now().plus({ hours: 1 }).toFormat('yyyy-MM-dd HH:mm:ss')
    const createdAt = DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')

    // Guardar el token en la base de datos (PasswordReset)
    await PasswordReset.create({
      email,
      token,
      expiresAt,
      createdAt,
    })

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
    console.log(resetLink)

    // Enviar correo electrónico con el enlace de reseteo de contraseña
    // await Mail.send((message) => {
    //   message
    //     .from(`${process.env.MAILGUN_DOMAIN}`)
    //     .to("lisoc65869@rowplant.com")
    //     .subject('Solicitud de Reseteo de Contraseña')
    //     .html(`
    //       <h1>Solicitud de Reseteo de Contraseña</h1>
    //       <p>Hola ${user.firstName},</p>
    //       <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el enlace a continuación para restablecerla:</p>
    //       <p><a href="${resetLink}">Resetear mi contraseña</a></p>
    //       <p>Si no solicitaste este reseteo, puedes ignorar este correo.</p>
    //       <p>Saludos,<br>El equipo de soporte</p>
    //     `)
    // })

    return response.json({ message: 'Password reset link sent' })
  }

  // Método para reseteo de contraseña
  public async resetPassword({ request, response }: HttpContextContract) {
    const { token, new_password } = request.only(['token', 'new_password'])

    const passwordReset = await PasswordReset.query().where('token', token).where('expires_at', '>', DateTime.now().toJSDate()).first()

    if (!passwordReset) {
      return response.status(400).json({ message: 'Invalid or expired token' })
    }

    const user = await User.findBy('email', passwordReset.email)

    if (!user) {
      return response.status(404).json({ message: 'User not found' })
    }

    user.password = new_password
    await user.save()

    // Eliminar el token después de usarlo
    await passwordReset.delete()

    return response.json({ message: 'Password reset successfully' })
  }

}

