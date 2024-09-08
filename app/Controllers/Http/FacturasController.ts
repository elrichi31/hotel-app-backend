import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Factura from 'App/Models/Factura'
import Producto from 'App/Models/Producto'

export default class FacturasController {
  public async index({ response }: HttpContextContract) {
    try {
      const facturas = await Factura.query().preload('productos')
      return response.json(facturas)
    } catch (error) {
      return response.status(500).json({ message: 'Error fetching facturas', error })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const facturaData = request.body()

    try {
      const { nombre, apellido, identificacion, direccion, telefono, correo, numero_factura, fecha_emision, subtotal, descuento, total, forma_pago, observaciones, estado, productos, venta_id } = facturaData

      // Validar que todos los campos requeridos están presentes
      if (!nombre || !apellido || !identificacion || !direccion || !correo || !numero_factura || !fecha_emision || !subtotal || !total || !forma_pago || !estado || !venta_id) {
        return response.status(400).json({ message: 'Todos los campos requeridos deben estar presentes' })
      }

      // Verificar si el número de factura ya existe
      const existingFactura = await Factura.findBy('numero_factura', numero_factura)
      if (existingFactura) {
        return response.status(400).json({ message: 'El número de factura ya existe' })
      }

      // Crear la factura
      const factura = await Factura.create({
        nombre, apellido, identificacion, direccion, telefono, correo, numero_factura, fecha_emision, subtotal, descuento, total, forma_pago, observaciones, estado, ventaId: venta_id
      })

      // Crear productos asociados si se proporcionan
      if (productos && Array.isArray(productos)) {
        for (const productoData of productos) {
          await factura.related('productos').create(productoData)
        }
      }

      // Cargar los productos relacionados
      await factura.load('productos')

      return response.status(201).json(factura)
    } catch (error) {
      console.error('Error creating factura:', error)
      return response.status(500).json({ message: 'Error creating factura', error })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.query().preload('productos').where('id', params.id).firstOrFail()
      return response.json(factura)
    } catch (error) {
      return response.status(404).json({ message: 'Factura not found', error })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    const data = request.only(['nombre', 'apellido', 'identificacion', 'direccion', 'telefono', 'correo', 'numero_factura', 'fecha_emision', 'subtotal', 'descuento', 'total', 'forma_pago', 'observaciones', 'estado', 'productos', 'venta_id'])

    try {
      const factura = await Factura.findOrFail(params.id)
      const productos = data.productos
      delete data.productos

      factura.merge(data)
      await factura.save()

      if (productos && Array.isArray(productos)) {
        // Eliminar los productos existentes antes de añadir los nuevos
        await Producto.query().where('factura_id', factura.id).delete()
        for (const productoData of productos) {
          await factura.related('productos').create(productoData)
        }
      }

      await factura.load('productos')

      return response.json(factura)
    } catch (error) {
      return response.status(400).json({ message: 'Error updating factura', error })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.findOrFail(params.id)
      await factura.delete()
      return response.status(204).json(null)
    } catch (error) {
      return response.status(400).json({ message: 'Error deleting factura', error })
    }
  }

  public async findByNumero({ params, response }: HttpContextContract) {
    try {
      const factura = await Factura.query().preload('productos').where('numero_factura', params.numero).firstOrFail()
      return response.json(factura)
    } catch (error) {
      return response.status(404).json({ message: 'Factura not found', error })
    }
  }

  public async getFacturasByVenta({ params, response }: HttpContextContract) {
    try {
      const facturas = await Factura.query().preload('productos').where('venta_id', params.id)
      if (facturas.length === 0) {
        return response.status(200).json({ message: 'No se encontraron facturas para esta venta.' })
      }
      return response.json(facturas)
    } catch (error) {
      return response.status(500).json({ message: 'Error al obtener las facturas.', error })
    }
  }
}
