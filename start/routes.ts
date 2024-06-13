/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import swagger from '#config/swagger'
import router from '@adonisjs/core/services/router'
import AutoSwagger from 'adonis-autoswagger'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')
const UsersController = () => import('#controllers/users_controller')

router
  .group(() => {
    router
      .group(() => {
        router.post('/admin/login', [AuthController, 'adminLogin'])
        router.post('/login', [AuthController, 'login'])
        router.post('/register', [AuthController, 'register'])
        router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
        router.post('/forgot-password', [AuthController, 'forgotPassword'])
        router.post('/reset-password', [AuthController, 'resetPassword'])
      })
      .prefix('/auth')

    router
      .group(() => {
        router.get('/users', [UsersController, 'index']).middleware(middleware.admin())
      })
      .middleware(middleware.auth())
  })
  .prefix('/api')

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})
