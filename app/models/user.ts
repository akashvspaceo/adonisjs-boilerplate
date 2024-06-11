import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { compose } from '@adonisjs/core/helpers'
import stringHelpers from '@adonisjs/core/helpers/string'
import hash from '@adonisjs/core/services/hash'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import PasswordReset from './password_reset.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @hasMany(() => PasswordReset, {
    foreignKey: 'tokenableId',
    serializeAs: null,
  })
  declare passwordResets: HasMany<typeof PasswordReset>

  generateAccessToken() {
    return User.accessTokens.create(this, ['*'], {
      expiresIn: '30d',
    })
  }

  removeAccessToken(id: string) {
    return User.accessTokens.delete(this, id)
  }

  async generatePasswordResetToken() {
    const token = stringHelpers.random(32)
    const passwordReset = await (this as User).related('passwordResets').create({
      token,
    })
    return passwordReset
  }
}
