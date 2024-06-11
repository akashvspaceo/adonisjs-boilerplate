/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    router
      .group(() => {
        router.post('/login', [AuthController, 'login'])
        router.post('/register', [AuthController, 'register'])
        router.post('/logout', [AuthController, 'logout']).use(middleware.auth())
        router.post('/forgot-password', [AuthController, 'forgotPassword'])
        router.post('/reset-password', [AuthController, 'resetPassword'])
      })
      .prefix('/auth')
  })
  .prefix('/api')

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})
