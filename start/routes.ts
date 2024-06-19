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
Route.post('register', 'AuthController.register')
Route.post('login', 'AuthController.login')
Route.post('/logout', 'AuthController.logout').middleware('auth')
Route.get('/api/user', 'UsersController.show').middleware('auth');

Route.group(() => {
  // Ruta para listar todos los clientes
  Route.get('/clientes', 'ClientesController.index')
  // Ruta para obtener un cliente específico
  Route.get('/clientes/:id', 'ClientesController.show')
  // Ruta para crear un nuevo cliente
  Route.post('/clientes', 'ClientesController.store')
  // Ruta para actualizar un cliente existente
  Route.put('/clientes/:id', 'ClientesController.update')
  // Ruta para borrar un cliente
  Route.delete('/clientes/:id', 'ClientesController.destroy')
}).middleware('auth')

