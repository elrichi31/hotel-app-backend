import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import RegistroPersona from 'App/Models/RegistroPersona'

export default class RegistroPersonaController {
  public async index({ response }: HttpContextContract) {
    try {
      const personas = await RegistroPersona.all()
      return response.json(personas)
    } catch (error) {
      return response.status(500).json({ message: 'Error fetching personas', error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const personasData = request.input('personas')

    if (!Array.isArray(personasData)) {
      return response.status(400).json({ message: 'Invalid data format, expected an array of personas' })
    }

    try {
        console.log(personasData)
      const personas = await RegistroPersona.createMany(personasData)
      return response.status(201).json(personas)
    } catch (error) {
      console.error('Error creating personas:', error)
      return response.status(400).json({ message: 'Error creating personas', error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const persona = await RegistroPersona.findOrFail(params.id)
      return response.json(persona)
    } catch (error) {
      return response.status(404).json({ message: 'Persona not found', error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const persona = await RegistroPersona.findOrFail(params.id)
      const data = request.only(['nombre', 'apellido', 'tipo_documento', 'numero_documento', 'ciudadania', 'procedencia'])
      persona.merge(data)
      await persona.save()
      return response.json(persona)
    } catch (error) {
      return response.status(400).json({ message: 'Error updating persona', error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const persona = await RegistroPersona.findOrFail(params.id)
      await persona.delete()
      return response.status(204).json(null)
    } catch (error) {
      return response.status(400).json({ message: 'Error deleting persona', error })
    }
  }
  public async validateCedula({ params, response }: HttpContextContract) {
    const { cedula } = params

    try {
      const persona = await RegistroPersona.query().where('numero_documento', cedula).first()
      if (persona) {
        return response.status(200).json(persona)
      } else {
        return response.status(404).json({ message: 'Cédula no encontrada' })
      }
    } catch (error) {
      console.error('Error validating cedula:', error)
      return response.status(400).json({ message: 'Error validating cedula', error })
    }
  }

}
