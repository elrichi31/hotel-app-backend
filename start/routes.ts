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

Route.get('/posts', 'PostsController.index')
Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')
Route.post('/logout', 'AuthController.logout').middleware('auth')
Route.get('/api/user', 'UsersController.show').middleware('auth');

Route.group(() => {
  Route.get('/clientes', 'ClientesController.index')
  Route.get('/clientes/:id', 'ClientesController.show')
  Route.post('/clientes', 'ClientesController.store')
  Route.put('/clientes/:id', 'ClientesController.update')
  Route.delete('/clientes/:id', 'ClientesController.destroy')
  Route.get('/clientes/cedula/:cedula', 'ClientesController.findByCedula')
}).middleware('auth')

Route.group(() => {
  Route.get('/habitaciones', 'HabitacionesController.index')
  Route.get('/habitaciones/:id', 'HabitacionesController.show')
  Route.post('/habitaciones', 'HabitacionesController.store')
  Route.put('/habitaciones/:id', 'HabitacionesController.update')
  Route.delete('/habitaciones/:id', 'HabitacionesController.destroy')
}).middleware('auth')

Route.group(() => {
  Route.get('/ventas', 'VentaController.index')
  Route.get('/ventas/:id', 'VentaController.show')
  Route.post('/ventas', 'VentaController.store')
  Route.put('/ventas/:id', 'VentaController.update')
  Route.delete('/ventas/:id', 'VentaController.destroy')
}).middleware('auth')

Route.group(() => {
  Route.get('personas', 'RegistroPersonasController.index')
  Route.post('personas', 'RegistroPersonasController.store')
  Route.get('personas/:id', 'RegistroPersonasController.show')
  Route.put('personas/:id', 'RegistroPersonasController.update')
  Route.delete('personas/:id', 'RegistroPersonasController.destroy')
  Route.get('personas/validate/:cedula', 'RegistroPersonasController.validateCedula') // Nueva ruta
}).middleware('auth')