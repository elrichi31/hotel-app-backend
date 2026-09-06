import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'
import Habitacion from 'App/Models/Habitacion'
import Precio from 'App/Models/Precio'
import RegistroPersona from 'App/Models/RegistroPersona'
import Venta from 'App/Models/Venta'
import Factura from 'App/Models/Factura'
import Producto from 'App/Models/Producto'
import Reserva from 'App/Models/Reserva'
import User from 'App/Models/User'

/** MySQL DATETIME no acepta el offset de zona que agrega `toSQL()`. */
const sql = (d: DateTime) => d.toFormat('yyyy-MM-dd HH:mm:ss')

/**
 * Datos de demostración para poder recorrer la app con contenido realista.
 *
 * Es destructivo a propósito: borra ventas, facturas, reservas, personas y
 * habitaciones antes de recrearlas, para que ejecutarlo dos veces no duplique
 * nada. NO toca el usuario admin ni ningún otro usuario que ya exista.
 *
 *   node ace db:seed --files="./database/seeders/DemoData.ts"
 */
export default class DemoDataSeeder extends BaseSeeder {
  // Solo en desarrollo: el seeder borra tablas antes de recrearlas.
  public static environment = ['development']

  private rng = 42

  /** Aleatorio con semilla fija: los datos son distintos entre sí pero reproducibles. */
  private random() {
    this.rng = (this.rng * 1103515245 + 12345) % 2147483648
    return this.rng / 2147483648
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(this.random() * arr.length)]
  }

  private int(min: number, max: number) {
    return Math.floor(this.random() * (max - min + 1)) + min
  }

  public async run() {
    await this.limpiar()

    const habitaciones = await this.crearHabitaciones()
    const personas = await this.crearPersonas()
    await this.crearUsuarios()
    await this.crearVentasYFacturas(habitaciones, personas)
    await this.crearReservas(habitaciones)

    console.log('\n  Datos de demostración creados:')
    console.log(`    habitaciones: ${await this.contar('habitacion')}`)
    console.log(`    precios:      ${await this.contar('precios')}`)
    console.log(`    personas:     ${await this.contar('registro_persona')}`)
    console.log(`    ventas:       ${await this.contar('ventas')}`)
    console.log(`    facturas:     ${await this.contar('facturas')}`)
    console.log(`    productos:    ${await this.contar('productos')}`)
    console.log(`    reservas:     ${await this.contar('reservas')}`)
    console.log(`    usuarios:     ${await this.contar('users')}\n`)
  }

  private async contar(tabla: string) {
    const res = await Database.from(tabla).count('* as total')
    return res[0].total
  }

  /** Borra en orden inverso a las dependencias para no chocar con las claves foráneas. */
  private async limpiar() {
    await Database.rawQuery('SET FOREIGN_KEY_CHECKS = 0')
    for (const tabla of [
      'productos',
      'facturas',
      'venta_habitacion_precio',
      'persona_venta',
      'ventas',
      'reserva_habitacion_precios',
      'reservas',
      'registro_persona',
      'precios',
      'habitacion',
    ]) {
      await Database.rawQuery(`TRUNCATE TABLE ${tabla}`)
    }
    await Database.rawQuery('SET FOREIGN_KEY_CHECKS = 1')
  }

  private async crearHabitaciones() {
    const tipos = [
      { tipo: 'Individual', camas: 1, base: 38, personas: [1, 2] },
      { tipo: 'Doble', camas: 2, base: 62, personas: [1, 2, 3] },
      { tipo: 'Suite', camas: 2, base: 120, personas: [2, 3, 4] },
      { tipo: 'Familiar', camas: 3, base: 95, personas: [2, 3, 4, 5] },
    ]

    const creadas: Habitacion[] = []

    // 4 pisos x 10 habitaciones = 40, numeradas 101..410
    for (let piso = 1; piso <= 4; piso++) {
      for (let n = 1; n <= 10; n++) {
        const cfg = tipos[(piso + n) % tipos.length]
        const ocupada = this.random() < 0.34

        const habitacion = await Habitacion.create({
          numero: `${piso}${String(n).padStart(2, '0')}`,
          tipo: cfg.tipo,
          estado: ocupada ? 'Ocupado' : 'Libre',
          descripcion: `Habitación ${cfg.tipo.toLowerCase()} en el piso ${piso}, ${cfg.camas} cama(s).`,
          numeroCamas: cfg.camas,
          fechaInicioOcupacion: ocupada ? DateTime.now().minus({ days: this.int(0, 3) }) : null,
          fechaFinOcupacion: ocupada ? DateTime.now().plus({ days: this.int(1, 5) }) : null,
        })

        // Una tarifa por cada cantidad de huéspedes admitida
        for (const p of cfg.personas) {
          await Precio.create({
            habitacionId: habitacion.id,
            numeroPersonas: p,
            precio: cfg.base + (p - 1) * 12 + piso * 2,
          })
        }

        creadas.push(habitacion)
      }
    }

    return creadas
  }

  private async crearPersonas() {
    const nombres = [
      'María', 'Carlos', 'Lucía', 'Andrés', 'Sofía', 'Diego', 'Valentina', 'Javier',
      'Camila', 'Mateo', 'Isabella', 'Sebastián', 'Daniela', 'Nicolás', 'Gabriela',
      'Tomás', 'Antonella', 'Emilio', 'Renata', 'Joaquín', 'Paula', 'Martín',
      'Elena', 'Rodrigo', 'Carolina', 'Felipe', 'Alejandra', 'Bruno', 'Natalia', 'Iván',
    ]
    const apellidos = [
      'García', 'Rodríguez', 'Martínez', 'López', 'Pérez', 'Gómez', 'Sánchez',
      'Ramírez', 'Torres', 'Flores', 'Vargas', 'Castillo', 'Rojas', 'Mendoza',
      'Herrera', 'Medina', 'Aguilar', 'Cabrera', 'Espinoza', 'Paredes',
    ]
    const paises = [
      'Ecuador', 'Colombia', 'Perú', 'Argentina', 'Chile', 'México', 'España',
      'Brasil', 'Estados Unidos', 'Uruguay',
    ]
    const ciudades = [
      'Quito', 'Guayaquil', 'Cuenca', 'Bogotá', 'Medellín', 'Lima', 'Buenos Aires',
      'Santiago', 'Ciudad de México', 'Madrid', 'São Paulo', 'Miami', 'Montevideo',
    ]

    const personas: RegistroPersona[] = []
    for (let i = 0; i < 60; i++) {
      const esPasaporte = this.random() < 0.3
      personas.push(
        await RegistroPersona.create({
          nombre: this.pick(nombres),
          apellido: `${this.pick(apellidos)} ${this.pick(apellidos)}`,
          tipo_documento: esPasaporte ? 'pasaporte' : 'cedula',
          // Documento único garantizado por el índice `i`
          numero_documento: esPasaporte
            ? `P${String(1000000 + i * 7919).slice(0, 7)}`
            : `${1700000000 + i * 13757}`,
          ciudadania: this.pick(paises),
          procedencia: this.pick(ciudades),
        })
      )
    }
    return personas
  }

  private async crearUsuarios() {
    const equipo = [
      { first: 'Lucía', last: 'Moreno', username: 'lmoreno', role: 'user', status: 'activo' },
      { first: 'Andrés', last: 'Salazar', username: 'asalazar', role: 'user', status: 'activo' },
      { first: 'Paola', last: 'Ríos', username: 'prios', role: 'admin', status: 'activo' },
      { first: 'Jorge', last: 'Benítez', username: 'jbenitez', role: 'user', status: 'inactivo' },
    ]

    for (const u of equipo) {
      const existe = await User.findBy('username', u.username)
      if (existe) continue
      await User.create({
        firstName: u.first,
        lastName: u.last,
        username: u.username,
        email: `${u.username}@hotelapp.local`,
        password: 'demo1234',
        role: u.role,
        status: u.status,
      })
    }
  }

  private async crearVentasYFacturas(habitaciones: Habitacion[], personas: RegistroPersona[]) {
    const formasPago = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia']
    const consumos = [
      { descripcion: 'Desayuno buffet', precio: 8.5 },
      { descripcion: 'Cena en restaurante', precio: 18.0 },
      { descripcion: 'Minibar', precio: 12.0 },
      { descripcion: 'Lavandería', precio: 9.5 },
      { descripcion: 'Servicio a la habitación', precio: 15.0 },
      { descripcion: 'Parqueadero', precio: 6.0 },
      { descripcion: 'Spa y masajes', precio: 45.0 },
      { descripcion: 'Traslado al aeropuerto', precio: 25.0 },
    ]

    // 120 ventas repartidas en los últimos 6 meses
    for (let i = 0; i < 120; i++) {
      const diasAtras = this.int(0, 180)
      const noches = this.int(1, 6)
      const inicio = DateTime.now().minus({ days: diasAtras }).set({ hour: 14, minute: 0 })
      const fin = inicio.plus({ days: noches }).set({ hour: 12, minute: 0 })

      const habitacion = this.pick(habitaciones)
      const precios = await Precio.query().where('habitacion_id', habitacion.id)
      if (precios.length === 0) continue
      const precio = this.pick(precios)

      const subtotal = Number(precio.precio) * noches
      const descuento = this.random() < 0.25 ? Math.round(subtotal * 0.1 * 100) / 100 : 0
      const total = Math.round((subtotal - descuento) * 100) / 100

      const venta = await Venta.create({
        fechaInicio: inicio,
        fechaFin: fin,
        descuento,
        subtotal,
        total,
      })
      // Sin esto las filas quedarían todas con la fecha de hoy y los
      // listados ordenados por fecha no mostrarían ninguna variación.
      await Database.from('ventas')
        .where('id', venta.id)
        .update({ created_at: sql(inicio), updated_at: sql(inicio) })

      await venta.related('habitaciones').attach({
        [habitacion.id]: { precio_id: precio.id },
      })

      // Entre 1 y 3 huéspedes por venta, sin repetir
      const huespedes = new Set<number>()
      const cuantos = this.int(1, Math.min(3, precio.numeroPersonas))
      while (huespedes.size < cuantos) huespedes.add(this.pick(personas).id)
      await venta.related('personas').attach([...huespedes])

      // El 70% de las ventas tiene factura
      if (this.random() < 0.7) {
        const titular = personas.find((p) => p.id === [...huespedes][0])!
        const items = this.int(1, 4)
        let extras = 0
        const elegidos: typeof consumos = []
        for (let k = 0; k < items; k++) {
          const c = this.pick(consumos)
          elegidos.push(c)
          extras += c.precio
        }

        const facSubtotal = Math.round((subtotal + extras) * 100) / 100
        const facTotal = Math.round((facSubtotal - descuento) * 100) / 100

        const factura = await Factura.create({
          nombre: titular.nombre,
          apellido: titular.apellido,
          identificacion: titular.numero_documento,
          direccion: `${this.pick(['Av. Amazonas', 'Calle Larga', 'Av. República', 'Calle Bolívar'])} N${this.int(10, 99)}-${this.int(10, 99)}`,
          telefono: `09${this.int(10000000, 99999999)}`,
          correo: `${titular.nombre.toLowerCase()}.${titular.apellido.split(' ')[0].toLowerCase()}@correo.com`,
          fecha_emision: fin,
          subtotal: facSubtotal,
          descuento,
          total: facTotal,
          forma_pago: this.pick(formasPago),
          observaciones: this.random() < 0.3 ? 'Cliente frecuente.' : undefined,
          estado: this.pick(['emitido', 'emitido', 'emitido', 'guardado', 'anulado']) as any,
          ventaId: venta.id,
        })
        await Database.from('facturas')
          .where('id', factura.id)
          .update({ created_at: sql(fin), updated_at: sql(fin) })

        for (const c of elegidos) {
          await Producto.create({
            cantidad: this.int(1, 3),
            descripcion: c.descripcion,
            precio_unitario: c.precio,
            facturaId: factura.id,
          })
        }
      }
    }
  }

  private async crearReservas(habitaciones: Habitacion[]) {
    const nombres = ['Ana', 'Luis', 'Marta', 'Pedro', 'Silvia', 'Ricardo', 'Verónica', 'Óscar', 'Patricia', 'Hugo']
    const apellidos = ['Navarro', 'Cordero', 'Salinas', 'Peralta', 'Bustos', 'Ibarra', 'Vega', 'Cañizares']

    // 45 reservas: unas pasadas, la mayoría próximas
    for (let i = 0; i < 45; i++) {
      const futura = this.random() < 0.75
      const offset = futura ? this.int(1, 60) : -this.int(1, 90)
      const noches = this.int(1, 7)
      const inicio = DateTime.now().plus({ days: offset })
      const fin = inicio.plus({ days: noches })

      const habitacion = this.pick(habitaciones)
      const precios = await Precio.query().where('habitacion_id', habitacion.id)
      if (precios.length === 0) continue
      const precio = this.pick(precios)

      const nombre = this.pick(nombres)
      const apellido = this.pick(apellidos)

      const reserva = await Reserva.create({
        nombre,
        apellido,
        email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@correo.com`,
        telefono: `09${this.int(10000000, 99999999)}`,
        fecha_inicio: inicio.toJSDate(),
        fecha_fin: fin.toJSDate(),
        numero_personas: precio.numeroPersonas,
        estado: futura
          ? (this.pick(['pendiente', 'confirmado', 'confirmado']) as any)
          : (this.pick(['confirmado', 'cancelada']) as any),
        total: Math.round(Number(precio.precio) * noches * 100) / 100,
      })

      await reserva.related('habitaciones').attach({
        [habitacion.id]: { precio_id: precio.id },
      })
    }
  }
}
