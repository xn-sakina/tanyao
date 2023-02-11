import chalk from 'tanyao/compiled/chalk'

const prefix = process.env.TANYAO_LOG_PREFIX || ''
const log = console.log

enum ELevel {
  info = 'info',
  error = 'error',
  success = 'success',
}

let prevCallLevel: ELevel | null = null
const logSpace = (msg: string) => {
  log(`       ${msg}`)
}

export const logger = {
  info: (msg: string, ...args: any[]) => {
    if (prevCallLevel === ELevel.info) {
      logSpace(msg)
      return
    }
    prevCallLevel = ELevel.info
    log(`${prefix}${chalk.bold.cyan('info')} - ${msg}`, ...args)
  },
  error: (msg: string, ...args: any[]) => {
    if (prevCallLevel === ELevel.error) {
      logSpace(msg)
      return
    }
    prevCallLevel = ELevel.error
    log(`${prefix}${chalk.bold.red('fail')} - ${msg}`, ...args)
  },
  success: (msg: string, ...args: any[]) => {
    if (prevCallLevel === ELevel.success) {
      logSpace(msg)
      return
    }
    prevCallLevel = ELevel.success
    log(`${prefix}${chalk.bold.green('done')} - ${msg}`, ...args)
  },
  debug: (msg: string, ...args: any[]) => {
    if (process.env.DEBUG_TANYAO) {
      log(`${prefix}${chalk.bold.gray('debug')} - ${msg}`, ...args)
    }
  },
}
