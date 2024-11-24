import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    // Verifica si ya existe un usuario administrador
    const adminExists = await User.findBy('email', 'admin@example.com')
    if (!adminExists) {
      // Crea el usuario por defecto
      await User.create({
        firstName: 'admin',
        lastName: 'admin',
        username: 'admin',
        email: 'admin@example.com',
        password: "admin123", // Asegúrate de hash de la contraseña
        role: 'admin', // Agrega el rol si tienes un sistema de roles
        status: 'activo' // Agrega el estado si tienes un sistema de estados
      })
    }
  }
}
