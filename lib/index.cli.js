#!/usr/bin/env node
/* eslint-disable */
import yargs from 'yargs'
import { colors, dir, log, purgeDir } from './utils'
import readline from 'readline'
import { Assemble, Init } from './lib'

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

export async function askBeforePurge() {
  async function askBeforePurge() {
    const read = readline.createInterface(process.stdin)
    return new Promise((resolve, reject) => {
      log.warning('Emptying Directory')
      log.warning('Are you sure?')
      console.log()
      log.warning('Enter (Y) or (N)')
      read.question('Are you sure (Y/N)', a => {
        read.close()

        if (a === 'Y' || a === 'y' || a === 'yes')
          resolve('Y')
        if (a === 'N' || a === 'n' || a === 'no')
          resolve('N')

        reject('Could not determine answer')
      })
    })
  }

  const purge = await askBeforePurge()
    .catch(e => { throw e })

  switch(purge) {
    case 'Y':
      purgeDir(dir)
      return true

    case 'N':
      return false
  }
}

export async function error_exit(
  ...msg
) {
  log.error(...colors.red('Panicing'))
  log.error(...msg)
  return purgeDir(dir)
}

(async () => {
  if (argv.purge) 
    await askBeforePurge()
      .catch(e => { throw e })

  if (argv.init)
    await Init(dir)
      .catch(e => { throw e })

  if (argv.assemble) 
    await Assemble(dir)
      .catch(e => { throw e })

})().catch(e => error_exit(e))