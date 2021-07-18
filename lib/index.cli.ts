#!/usr/bin/env node
import yargs from 'yargs'
import { colors, log, purgeDir } from './utils'
import readline from 'readline'

const argv = yargs.option('purge', {
  alias: 'p',
  describe: 'Empty the current directory'
}).usage('daisweb3 -p').help(
).option('init', {
  alias: 'i',
  describe: `Write a template ${colors.cyan('.daisconfig')} file` 
}).usage('daisweb3 -i').help(
).option('assemble', {
  alias: 'a',
  describe: 'Build the boilerplate'
}).usage('daisweb3 -a').help().argv

export const dir = process.cwd()

enum Purge {
  Y,
  N
}
export async function askBeforePurge(): Promise<boolean> {
  async function askBeforePurge(): Promise<Purge> {
    const read = readline.createInterface(process.stdin)
    return new Promise((resolve, reject) => {
      log.warning('Emptying Directory')
      log.warning('Are you sure?')
      console.log()
      log.warning('Enter (Y) or (N)')
      read.question('Are you sure (Y/N)', a => {
        read.close()

        if (a === 'Y' || a === 'y' || a === 'yes')
          resolve(Purge['Y'])
        if (a === 'N' || a === 'n' || a === 'no')
          resolve(Purge['N'])

        reject('Could not determine answer')
      })
    })
  }

  const purge = await askBeforePurge()
    .catch(e => { throw e })

  switch(purge) {
    case Purge['Y']:
      return purgeDir(dir)
        .then(() => true, e => { throw e })

    case Purge['N']:
      return false
  }
}

export async function error_exit<E>(
  ...msg: E[]
): Promise<void[]> {
  log.error(...colors.red('Panicing'))
  log.error(...msg)
  return purgeDir(dir)
}

(async () => {
  if (argv.purge) 
    await askBeforePurge()
      .catch(e => { throw e })

  if (argv.init)
    console.log('init')

  if (argv.assemble) 
    console.log('assemble')

})().catch(e => error_exit(e))