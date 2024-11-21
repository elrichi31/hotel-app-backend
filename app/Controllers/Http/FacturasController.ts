import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Factura from 'App/Models/Factura'
import Producto from 'App/Models/Producto'
import Mail from '@ioc:Adonis/Addons/Mail'

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
      const { nombre, apellido, identificacion, direccion, telefono, correo, fecha_emision, subtotal, descuento, total, forma_pago, observaciones, estado, productos, venta_id } = facturaData

      // Validar que todos los campos requeridos están presentes
      if (!nombre || !apellido || !identificacion || !direccion || !correo || !fecha_emision || !subtotal || !total || !forma_pago || !estado || !venta_id) {
        return response.status(400).json({ message: 'Todos los campos requeridos deben estar presentes' })
      }

      // Crear la factura
      const factura = await Factura.create({
        nombre,
        apellido,
        identificacion,
        direccion,
        telefono,
        correo,
        fecha_emision,
        subtotal,
        descuento,
        total,
        forma_pago,
        observaciones,
        estado,
        ventaId: venta_id,
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
    const data = request.only([
      'nombre',
      'apellido',
      'identificacion',
      'direccion',
      'telefono',
      'correo',
      'fecha_emision',
      'subtotal',
      'descuento',
      'total',
      'forma_pago',
      'observaciones',
      'estado',
      'productos',
      'venta_id',
    ])

    try {
      const factura = await Factura.findOrFail(params.id)
      const productos = data.productos
      delete data.productos

      const previousState = factura.estado // Guardar el estado anterior

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

      // Si el estado cambia a "emitido", enviar un correo al cliente
      if (previousState !== 'emitido' && factura.estado === 'emitido') {
        await this.sendFacturaEmail(factura)
      }

      return response.json(factura)
    } catch (error) {
      return response.status(400).json({ message: 'Error updating factura', error })
    }
  }

  private async sendFacturaEmail(factura: Factura) {
    const emailContent = `
      <h1>Factura Emitida</h1>
      <p>Estimado/a ${factura.nombre} ${factura.apellido},</p>
      <p>Le informamos que su factura ha sido emitida exitosamente. A continuación, algunos detalles de su factura:</p>
      <ul>
        <li><strong>Fecha de Emisión:</strong> ${factura.fecha_emision}</li>
        <li><strong>Subtotal:</strong> $${factura.subtotal.toFixed(2)}</li>
        <li><strong>Descuento:</strong> $${factura.descuento.toFixed(2)}</li>
        <li><strong>Total:</strong> $${factura.total.toFixed(2)}</li>
        <li><strong>Forma de Pago:</strong> ${factura.forma_pago}</li>
      </ul>
      <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
      <p>Saludos,<br>El equipo de HotelApp</p>
    `

    try {
      await Mail.send((message) => {
        message
          .from(`noreply@${process.env.MAILGUN_DOMAIN}`)
          .to(factura.correo)
          .subject('Factura Emitida')
          .html(emailContent)
      })
    } catch (error) {
      console.error('Error sending email:', error)
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
