import { getConfig } from './config'
import { logger } from './logger'
import { Clipboard } from '@napi-rs/clipboard'
import fs from 'fs-extra'
import gitParser from 'git-url-parse'
import path from 'path'
import prompts from 'prompts'
import chalk from 'tanyao/compiled/chalk'
import { execa } from 'tanyao/compiled/execa'

const clipboard = new Clipboard()

export const clone = async (opts: { repo: string; dir: string }) => {
  let { repo, dir } = opts
  const config = await getConfig()
  if (!config) {
    return
  }

  // alias transform
  const alias = config.alias || {}
  const firstMatchedAlias = Object.keys(alias).find((key) => {
    return repo.startsWith(key)
  })
  if (firstMatchedAlias) {
    const prev = alias[firstMatchedAlias]
    const tail = repo.slice(firstMatchedAlias.length)
    const dotGit = tail.endsWith('.git') ? '' : '.git'
    repo = `${prev}${tail}${dotGit}`
  }

  let parsedRepo = gitParser(repo)
  const matchedCodebase = config.codebase.find((codebase) => {
    return parsedRepo.resource === codebase.url
  })
  if (!matchedCodebase) {
    logger.error(`No matched codebase found for repo: ${chalk.red(repo)}`)
    return
  }
  logger.debug('parsedRepo: ', parsedRepo!)

  // clone base
  let selectedBase: string | null = null
  const useSpecifiedDir = dir?.length
  if (useSpecifiedDir) {
    selectedBase = dir
  } else {
    const base = config.base as string[]
    if (base.length === 1) {
      selectedBase = base[0]
    } else {
      // prompt select
      const response = await prompts({
        type: 'select',
        name: 'value',
        message: 'Select clone base dir',
        choices: base.map((item) => {
          const dirname = path.basename(path.dirname(item))
          const basename = path.basename(item)
          const title = `${dirname}/${basename}`
          return {
            title: title,
            value: item,
          }
        }),
      })
      if (!response.value) {
        logger.info('Cancel clone')
        return
      }
      selectedBase = response.value
    }
  }
  // targetDir
  const base = selectedBase as string
  const source = parsedRepo.resource
  const pathname = parsedRepo.full_name
  const targetDir = useSpecifiedDir ? dir : path.join(base, source, pathname)

  const copyPath = () => {
    clipboard.setText(`cd ${targetDir}`)
    logger.info(
      `The ${chalk.cyan(
        'cd'
      )} command has been copied to clipboard, you can paste it`
    )
    logger.info('e.g. cmd/ctrl + v')
  }

  // check exist
  if (fs.pathExistsSync(targetDir)) {
    logger.error(
      `Repo ${chalk.magenta(pathname)} already exists in ${chalk.green(
        targetDir
      )}`
    )
    // copy
    copyPath()
    return
  }

  // clone
  logger.info(
    `☕️ Cloning ${chalk.magenta(pathname)} to ${chalk.cyan(
      path.basename(base)
    )} ...`
  )
  try {
    await execa('git', ['clone', repo, targetDir], {
      // allow use relative path clone
      cwd: process.cwd(),
    })
    // success
    logger.success(`🎉 Clone success`)
    // copy
    copyPath()
  } catch (e) {
    logger.error(`Clone ${chalk.red(repo)} failed`)
    throw new Error('Clone failed', { cause: e })
  }

  // set username and email
  const setGitConfig = async () => {
    const username = matchedCodebase.username
    const email = matchedCodebase.email
    if (!username || !email) {
      throw new Error('No username or email found')
    }
    await execa('git', ['config', '--replace-all', 'user.name', username], {
      cwd: targetDir,
    })
    await execa('git', ['config', '--replace-all', 'user.email', email], {
      cwd: targetDir,
    })
    logger.success(
      `Set git user ${chalk.blue(`${username}(${email})`)} success`
    )
  }
  setGitConfig()
}
