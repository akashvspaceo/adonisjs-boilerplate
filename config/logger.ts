import env from '#start/env'
import { defineConfig, targets } from '@adonisjs/core/logger'
import app from '@adonisjs/core/services/app'
import fs from 'node:fs'
import pino from 'pino'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}

/**
 * Customize pino logger
 */
export const pinoLogger = (): pino.Logger => {
  const logFilepath = 'logs/app.log'
  if (!fs.existsSync(logFilepath)) {
    fs.writeFileSync(logFilepath, '')
  }
  const stream = pino.destination({
    dest: logFilepath,
  })
  // @ts-ignore
  return pino(stream)
}
