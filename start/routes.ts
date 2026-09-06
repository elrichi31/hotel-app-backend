/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('/password/forgot', 'UsersController.requestPasswordReset')
Route.post('/password/reset', 'UsersController.resetPassword')

Route.get('/posts', 'PostsController.index')
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')
Route.post('/logout', 'AuthController.logout').middleware('auth')
Route.get('/api/user', 'UsersController.show').middleware('auth');

Route.group(() => {
  Route.get('/user', 'UsersController.show');
  Route.get('/users', 'UsersController.index');
  Route.get('/users/:id', 'UsersController.getUser');
  Route.post('/users', 'UsersController.create');
  Route.put('/users/:id', 'UsersController.update');
  Route.delete('/users/:id', 'UsersController.delete');
}).middleware(['auth', 'role:admin']);

Route.group(() => {
  Route.get('/clientes', 'ClientesController.index')
  Route.get('/clientes/:id', 'ClientesController.show')
  Route.post('/clientes', 'ClientesController.store')
  Route.put('/clientes/:id', 'ClientesController.update')
  Route.delete('/clientes/:id', 'ClientesController.destroy')
  Route.get('/clientes/cedula/:cedula', 'ClientesController.findByCedula')
}).middleware(['auth', 'status'])

Route.group(() => {
  Route.get('/habitaciones', 'HabitacionesController.index')
  Route.get('/habitaciones/:id', 'HabitacionesController.show')
  Route.post('/habitaciones', 'HabitacionesController.store')
  Route.put('/habitaciones/:id', 'HabitacionesController.update')
  Route.delete('/habitaciones/:id', 'HabitacionesController.destroy')
}).middleware('auth')

Route.get('/dashboard/stats', 'DashboardController.stats').middleware('auth')

Route.get('/configuracion', 'ConfiguracionController.show').middleware('auth')
Route.put('/configuracion', 'ConfiguracionController.update').middleware(['auth', 'role:admin'])
Route.get('/configuracion/reservas-libres-api-key', 'ConfiguracionController.showApiKey').middleware(['auth', 'role:admin'])
Route.post('/configuracion/reservas-libres-api-key/regenerar', 'ConfiguracionController.regenerarApiKey').middleware(['auth', 'role:admin'])

Route.group(() => {
  Route.get('personas', 'RegistroPersonasController.index')
  Route.post('personas', 'RegistroPersonasController.store')
  Route.get('personas/:id', 'RegistroPersonasController.show')
  Route.put('personas/:id', 'RegistroPersonasController.update')
  Route.delete('personas/:id', 'RegistroPersonasController.destroy')
  Route.get('personas/validate/:cedula', 'RegistroPersonasController.validateCedula') // Nueva ruta
}).middleware(['auth'])

Route.group(() => {
  Route.post('ventas', 'VentaController.store')
  Route.get('ventas', 'VentaController.index')
  Route.get('ventas/:id', 'VentaController.show')
  Route.put('ventas/:id', 'VentaController.update')
  Route.delete('ventas/:id', 'VentaController.destroy')
  Route.post('ventas/:id/check-in', 'VentaController.checkIn')
  Route.post('ventas/:id/check-out', 'VentaController.checkOut')
}).middleware('auth')

Route.group(() => {
  Route.post('facturas', 'FacturasController.store')
  Route.get('facturas', 'FacturasController.index')
  Route.get('facturas/:id', 'FacturasController.show')
  Route.put('facturas/:id', 'FacturasController.update')
  Route.delete('facturas/:id', 'FacturasController.destroy')
  Route.get('/facturas/venta/:id', 'FacturasController.getFacturasByVenta')
}).middleware('auth')

Route.group(() => {
  Route.get('/reservas', 'ReservasController.index').middleware('auth')        // Obtener todas las reservas
  Route.get('/reservas/:id', 'ReservasController.show').middleware('auth')        // Obtener una reserva por su ID
  Route.post('/reservas', 'ReservasController.store')        // Crear una nueva reserva
  Route.put('/reservas/:id', 'ReservasController.update').middleware('auth')       // Actualizar una reserva existente
  Route.delete('/reservas/:id', 'ReservasController.destroy').middleware('auth')    // Eliminar una reserva
  Route.post('/reservas/disponible', 'ReservasController.availableRooms')
  Route.get('/confirm-reserva/:id', 'ReservasController.confirmReserva') // Confirmar reserva
  Route.post('/reservas/:id/aprobar', 'ReservasController.aprobar').middleware('auth') // Admin aprueba y genera la venta
  Route.post('/reservas/:id/rechazar', 'ReservasController.rechazar').middleware('auth') // Admin rechaza
})

// Reservas libres: registros que vienen de un catálogo externo, sin habitación real asociada.
// Nunca ocupan una habitación ni generan una Venta automáticamente.
Route.group(() => {
  Route.get('/reservas-libres', 'ReservasLibresController.index')
  Route.get('/reservas-libres/:id', 'ReservasLibresController.show')
  Route.put('/reservas-libres/:id', 'ReservasLibresController.update')
  Route.delete('/reservas-libres/:id', 'ReservasLibresController.destroy')
  Route.post('/reservas-libres/:id/validar', 'ReservasLibresController.validar')
  Route.post('/reservas-libres/:id/descartar', 'ReservasLibresController.descartar')
}).middleware('auth')

// Ingesta pública desde la página externa: autenticada por API key, no por login de usuario.
Route.post('/reservas-libres/ingest', 'ReservasLibresController.ingest').middleware('apikey')
