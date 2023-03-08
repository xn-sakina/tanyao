import { ITanyaoConfig } from './interface'
import { logger } from './logger'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'tanyao/compiled/chalk'
import { execa } from 'tanyao/compiled/execa'

export const getConfig = async () => {
  if (process.env.TEST_TANYAO) {
    logger.debug('Test mode, set CODE_BASE')
    process.env.CODE_BASE = path.join(__dirname, '../tests')
  }

  const home = process.env?.HOME || process.env?.USERPROFILE
  if (!home?.length) {
    logger.error(
      `No home directory found. Please set the ${chalk.bold.yellow(
        'HOME'
      )} environment variable.`
    )
    throw new Error('No home directory found.')
  }
  const globalConfigDir = path.join(home, '.config')
  const isExist = await fs.pathExists(globalConfigDir)
  if (!isExist) {
    await fs.mkdirp(globalConfigDir)
  }
  const tanyaoConfigDir = path.join(globalConfigDir, 'tanyao')
  const isTanyaoExist = await fs.pathExists(tanyaoConfigDir)
  if (!isTanyaoExist) {
    await fs.mkdirp(tanyaoConfigDir)
  }
  const tanyaoConfigPath = path.join(tanyaoConfigDir, 'config.json')
  const isConfigExist = await fs.pathExists(tanyaoConfigPath)
  // if not exist, create default config
  if (!isConfigExist) {
    const defaultConfig = await getDefaultConfig()
    await fs.writeFile(
      tanyaoConfigPath,
      `${JSON.stringify(defaultConfig, null, 2)}\n`,
      'utf-8'
    )
    logger.info(
      `First time to use ${chalk.blue('tanyao')}, default config file created`
    )
    // need set code `base` in config
    notFoundBaseTips(tanyaoConfigPath)
    return
  }
  // load config
  const configContent = await fs.readFile(tanyaoConfigPath, 'utf-8')
  const config = JSON.parse(configContent) as ITanyaoConfig

  // please check config file helper
  const checkHepler = (key: string) => {
    return `Please check the ${chalk.bold.yellow(
      key
    )} in config file at ${chalk.green(tanyaoConfigPath)}`
  }

  // check base
  if (!config?.base?.length) {
    logger.error(`No ${chalk.red('base')} found in config file`)
    notFoundBaseTips(tanyaoConfigPath)
    return
  }
  // parse base
  const base = config.base
  const baseAsArray = Array.isArray(base) ? base : [base]
  const parsedBase = (
    (baseAsArray.filter(Boolean) as string[])
      .map((item) => {
        // replace {env}
        const hasEnv = item.includes('{') && item.includes('}')
        if (hasEnv) {
          const envKey = item.match(/{(.*?)}/)?.[1]
          if (!envKey?.length) {
            logger.error(
              `Invalid env key in ${chalk.red(item)}. ${checkHepler('base')}`
            )
            return
          }
          const envValue = process.env[envKey]
          if (!envValue?.length) {
            logger.error(
              `No value found for env key ${chalk.red(envKey)}. ${checkHepler(
                'base'
              )}`
            )
            return
          }
          return item.replace(/{(.*?)}/, envValue)
        }
        return item
      })
      .filter(Boolean) as string[]
  ).map((item) => {
    // noamalize path
    return path.normalize(item)
  })
  // ehck base exist
  parsedBase.forEach((item) => {
    if (!fs.pathExistsSync(item)) {
      logger.error(
        `Base directory ${chalk.red(item)} not exist. ${checkHepler('base')}`
      )
      throw new Error('Base directory not exist')
    }
    const isDir = fs.statSync(item).isDirectory()
    if (!isDir) {
      logger.error(
        `Base directory ${chalk.red(item)} is not a directory. ${checkHepler(
          'base'
        )}`
      )
      throw new Error('Base directory is not a directory')
    }
  })
  // set base
  config.base = parsedBase

  // normalize codebase url
  config.codebase.forEach((item) => {
    const url = item.url
    // check url
    if (!url?.length) {
      logger.error(
        `Invalid url ${chalk.red(url)} in codebase config. ${checkHepler(
          'codebase'
        )}`
      )
      return
    }

    const isEndWithSlash = url.endsWith('/')
    if (isEndWithSlash) {
      item.url = url.slice(0, -1)
    }
  })

  return config
}

function notFoundBaseTips(configFilePath: string) {
  logger.info(
    `Please set the "${chalk.bold.yellow(
      'base'
    )}" in config file at ${chalk.green(configFilePath)}`
  )
  logger.info('e.g.')
  logger.info(`  "base": "/Users/username/Documents/Code"`)
  logger.info(
    `  "base": "{CODE_BASE}/Code" (CODE_BASE will replace to process.env.CODE_BASE)`
  )
}

async function getDefaultConfig() {
  const globalGitUsername = (await execa('git', ['config', 'user.name'])).stdout
  const globalGitEmail = (await execa('git', ['config', 'user.email'])).stdout
  // ensure has username and email
  if (!globalGitUsername?.length || !globalGitEmail?.length) {
    logger.error(
      `No git global ${chalk.bold.yellow('user.name')} or ${chalk.bold.yellow(
        'email'
      )} found. Please set the ${chalk.bold.yellow(
        'user.name'
      )} and ${chalk.bold.yellow('user.email')} in git config.`
    )
    // example
    logger.info('e.g.')
    logger.info(
      `  git config --global user.name ${chalk.bold.yellow('your name')}`
    )
    logger.info(
      `  git config --global user.email ${chalk.bold.yellow('your email')}`
    )
    throw new Error('No git username or email found.')
  }

  const defaultConfig: Partial<ITanyaoConfig> = {
    base: '',
    codebase: [
      {
        url: 'github.com',
        username: globalGitUsername,
        email: globalGitEmail,
      },
    ],
    alias: {
      'github://': 'https://github.com/',
    },
  }

  return defaultConfig
}
