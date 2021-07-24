#!/usr/bin/env node
/**
 * /* eslint-disable
 *
 * @format
 */

import yargs from 'yargs'
import { ask, colors, dir, log, purgeDir, trashDir } from './utils'
import readline from 'readline'
import { Assemble, fetchdaisconfig, Init } from './lib'

const argv = yargs
  .option('purge', {
    alias: 'p',
    describe: 'Empty the current directory'
  })
  .usage('daisweb3 -p')
  .help()
  .option('init', {
    alias: 'i',
    describe: `Write a template ${colors.cyan('.daisconfig')} file`
  })
  .usage('daisweb3 -i')
  .help()
  .option('assemble', {
    alias: 'a',
    describe: 'Build the boilerplate'
  })
  .usage('daisweb3 -a')
  .help()
  .option('yes', {
    alias: 'y',
    describe:
      'Run without asking any questions (will still ask on ' +
      colors.red('--purge')[0] +
      ')'
  })
  .usage('daisweb3 -y')
  .help()
  .option('confirm', {
    alias: 'c',
    describe: colors.green('Confirm the command')[0],
    required: true,
    demandOption: true
  }).argv

export async function askBeforePurge() {
  const dirInColor = colors.red(dir)[0]

  let purge = await ask(() => {
    log.withbox.error(`
    Are you sure you want to empty 
    ${dirInColor}`)
  }).catch(e => {
    throw new Error(e)
  })

  switch (purge) {
    case 'Y':
      break
    case 'N':
      return false
  }

  purge = await ask(() => {
    const msg = `Emptying ${dirInColor}`

    log.withbox.error(`
    ${colors.red('LAST CHANCE')[0]} (deleted items may not show 
      up in your Trash/Recycle Bin)
    
      ${msg}
      ${msg}
      ${msg}
      ${msg}
      ${msg}
    `)
  }).catch(e => {
    throw new Error(e)
  })

  switch (purge) {
    case 'Y':
      return trashDir(dir).then(
        () => {
          purgeDir(dir)
          return true
        },

        e => {
          throw e
        }
      )
    case 'N':
      return false
  }
}

export async function error_exit(...msg) {
  log.error('Panic!', ...colors.red('Error Exit Triggered'))
  for (const message of msg) log.error(message.message)
  purgeDir(dir)
  setImmediate(() => process.exit(1))
}

;(async () => {
  if (argv.purge)
    await askBeforePurge().catch(e => {
      log.error('Failed to purge directory: ')
      log.error(e.message)
      process.exit(1)
    })

  // Set the handler after askBeforePurge
  // Might no
  process.on('SIGINT', signal => {
    const [purgingDirMsg, dirInRed] = colors.red('purging directory', dir)

    // Giving room for whatever the child process was logging,
    // if any child process was running during the ctrl+c
    console.log()
    console.log()
    console.log()

    log.withbox.error(`
    Build canceled ${purgingDirMsg}
    ${dirInRed}
    `)

    purgeDir(dir)
    process.exit(1)
  })

  if (argv.init)
    await Init(dir).catch(e => {
      throw e
    })

  if (argv.assemble)
    await Assemble(
      await fetchdaisconfig(dir).catch(e => {
        throw e
      }),
      dir,
      argv.yes
    ).catch(e => {
      throw e
    })

  const text = colors.cyan('Boilerplate Assembled.', 'Happy hacking!')
  log.withbox(`
      ${text[0]}

      ${text[1]}
  `)
})().catch(e => error_exit(e))
