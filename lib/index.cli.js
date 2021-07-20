#!/usr/bin/env node

/* eslint-disable */
import yargs from 'yargs'
import { ask, colors, dir, log, purgeDir } from './utils'
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
  let purge = await ask(() => {
    log.error(`
    Are you sure you want to empty`, ...colors.yellow(dir)
    )
  })
    .catch(e => { throw e })

  switch (purge) {
    case 'Y':
      break;
    case 'N':
      return false
  }

  purge = await ask(() => {
    console.error(`
    ${colors.red('LAST CHANCE')[0]} (deleted items may not show up in your Trash/Recycle Bin)
    `
    ); log.error(`
    Emptying ${colors.cyan(dir)[0]}
    `
    )
  })
    .catch(e => { throw e })

  switch (purge) {
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
  log.error('Panic!', ...colors.red('Error Exit Triggered'))
  log.error(...msg)
  purgeDir(dir)
  setImmediate(() => process.exit(1))
}

(async () => {
  if (argv.purge)
    await askBeforePurge()
      .catch(e => {
        log.error('Failed to purge directory: ')
        log.error(e)
        process.exit(1)
      })

  if (argv.init)
    await Init(dir)
      .catch(e => { throw e })

  if (argv.assemble)
    await Assemble(dir)
      .catch(e => { throw e })

})().catch(e => error_exit(e))