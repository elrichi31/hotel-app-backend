import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Factura from 'App/Models/Factura'
import Venta from 'App/Models/Venta'

export default class FacturaController {
  public async index({ response }: HttpContextContract) {
    try {
      const facturas = await Factura.query().preload('venta')
      return response.json(facturas)
    } catch (error) {
      console.error('Error fetching facturas:', error)
      return response.status(500).json({ message: 'Error fetching facturas', error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.query()
        .where('id', params.id)
        .preload('venta')
        .firstOrFail()
      return response.json(factura)
    } catch (error) {
      console.error('Error fetching factura:', error)
      return response.status(404).json({ message: 'Factura not found', error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const { tipo_documento, nombre, apellido, direccion, telefono, correo, venta_id } = request.only(['tipo_documento', 'nombre', 'apellido', 'direccion', 'telefono', 'correo', 'venta_id'])

    try {
      // Verificar si la venta existe
      await Venta.findOrFail(venta_id)

      // Crear la factura
      const factura = await Factura.create({
        tipo_documento,
        nombre,
        apellido,
        direccion,
        telefono,
        correo,
        venta_id
      })

      return response.status(201).json(factura)
    } catch (error) {
      console.error('Error creating factura:', error)
      return response.status(400).json({ message: 'Error creating factura', error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const { tipo_documento, nombre, apellido, direccion, telefono, correo, venta_id } = request.only(['tipo_documento', 'nombre', 'apellido', 'direccion', 'telefono', 'correo', 'venta_id'])

    try {
      const factura = await Factura.findOrFail(params.id)

      // Verificar si la venta existe
      await Venta.findOrFail(venta_id)

      // Actualizar la factura
      factura.merge({
        tipo_documento,
        nombre,
        apellido,
        direccion,
        telefono,
        correo,
        venta_id
      })
      await factura.save()

      return response.json(factura)
    } catch (error) {
      console.error('Error updating factura:', error)
      return response.status(400).json({ message: 'Error updating factura', error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.findOrFail(params.id)
      await factura.delete()
      return response.status(204).json(null)
    } catch (error) {
      console.error('Error deleting factura:', error)
      return response.status(400).json({ message: 'Error deleting factura', error })
    }
  }
}
