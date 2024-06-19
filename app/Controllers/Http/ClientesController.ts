import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Cliente from 'App/Models/Cliente'

export default class ClienteController {
  // Listar todos los clientes
  public async index({ response }: HttpContextContract) {
    const clientes = await Cliente.all()
    return response.status(200).json(clientes)
  }

  // Obtener un cliente específico
  public async show({ params, response }: HttpContextContract) {
    try {
      const cliente = await Cliente.findOrFail(params.id)
      return response.status(200).json(cliente)
    } catch (error) {
      return response.status(404).json({ message: 'Cliente no encontrado' })
    }
  }

  // Crear un nuevo cliente
  public async store({ request, response }: HttpContextContract) {
    const data = request.only(['nombre', 'apellido', 'email', 'telefono', 'direccion', 'identificacion'])
    const cliente = await Cliente.create(data)
    return response.status(201).json(cliente)
  }

  // Actualizar un cliente existente
  public async update({ request, response, params }: HttpContextContract) {
    const data = request.only(['nombre', 'apellido', 'email', 'telefono', 'direccion', 'identificacion'])
    const cliente = await Cliente.findOrFail(params.id)
    cliente.merge(data)
    await cliente.save()
    return response.status(200).json(cliente)
  }

  // Borrar un cliente
  public async destroy({ response, params }: HttpContextContract) {
    const cliente = await Cliente.findOrFail(params.id)
    await cliente.delete()
    return response.status(200).json({ message: 'Cliente eliminado'})
  }
}
