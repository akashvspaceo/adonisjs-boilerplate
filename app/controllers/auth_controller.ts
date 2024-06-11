import PasswordReset from '#models/password_reset'
import User from '#models/user'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    const payload = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(payload.email, payload.password)
    const token = await user.generateAccessToken()

    return response.send({
      message: 'User logged in successfully',
      user,
      access_token: token.value!.release(),
    })
  }

  async register({ request, response }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)

    const exisistUser = await User.findBy('email', payload.email)
    if (exisistUser) {
      return response.badRequest({
        message: 'User already exists with this email address',
      })
    }

    const user = await User.create(payload)
    const token = await user.generateAccessToken()

    return response.send({
      message: 'User registered successfully',
      access_token: token.value!.release(),
    })
  }

  async logout({ response, auth }: HttpContext) {
    const user = auth.user
    user?.removeAccessToken(user.currentAccessToken.identifier as string)
    return response.send({
      message: 'User logged out successfully',
    })
  }

  async forgotPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(forgotPasswordValidator)
    const user = await User.findBy('email', payload.email)
    if (!user) {
      return response.notFound({
        message: 'User does not exists with this email address',
      })
    }
    const passwordReset = await user.generatePasswordResetToken()
    return response.send({
      message: 'Password reset token generated successfully',
      password_reset_token: passwordReset.token,
    })
  }

  async resetPassword({ request, response }: HttpContext) {
    const payload = await request.validateUsing(resetPasswordValidator)
    const passwordReset = await PasswordReset.findBy('token', payload.token)
    if (!passwordReset) {
      return response.badRequest({
        message: 'Invalid password reset token',
      })
    }

    await passwordReset.load('user')
    const user = passwordReset.user!
    user.password = payload.password
    await user.save()

    passwordReset.delete()

    return response.send({
      message: 'Password reset successfully',
    })
  }
}
