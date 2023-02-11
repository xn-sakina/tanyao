import { clone } from './clone'
import { init } from './init'
import { program } from 'commander'
import { join } from 'path'

export const main = async () => {
  const pkg = require(join(__dirname, '../package.json'))

  program
    .command('clone <repo> [dir]')
    .description('clone a repository')
    .action((repo, dir) => {
      clone({
        repo,
        dir,
      })
    })

  program
    .command('init')
    .description('init config')
    .action(() => {
      init()
    })

  program.name('tanyao').description('Git repo clone and multi-account manager')
  program.version(pkg.version)
  program.parse(process.argv)
}
