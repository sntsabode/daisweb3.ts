/** @format */

import { colors, log, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'
import { IDaisConfig } from './daisconfig'
import { Truffle } from './files/contracts/__contracts__'
import { spawn } from 'child_process'
import { Eslint, Ganache, Git, TS } from './files/configs/__configs__'
import { Truffle as TruffleConfigs } from './files/configs/__configs__'
import { readFileSync } from 'fs'
import { ProtocolFileWriter } from './protocol-writer'
import { StdioOptions } from 'child_process'

/**
 * Main function
 *
 * Builds the boilerplate in accordance with the options entered in
 * the **.daisconfig** file
 * @param dir
 */
export async function Assemble(
  daisconfig: IDaisConfig,
  dir: string,
  yes?: boolean,
  offline?: boolean
): Promise<void> {
  // It's best these run sequentially

  const contractDeps = await ProtocolFileWriter.instance
    .main(
      dir,
      daisconfig.contractImports,
      daisconfig.solversion,
      daisconfig.defaultNet
    )
    .catch(e => {
      throw e
    })

  await Promise.all([
    writeTruffleFiles(dir, daisconfig.solversion, daisconfig.contractWriteDir),

    tscInit(dir)
  ]).catch(e => {
    throw e
  })

  switch (daisconfig.packman) {
    // prettier-ignore
    case 'yarn':
      await yarninit(yes).catch(e => {
        throw e
      })
    break;

    // prettier-ignore
    case 'npm':
      await npminit(yes).catch(e => {
        throw e
      })
    break;

    // prettier-ignore
    default:
      log.withbox.error(`
        Unsupported package manager...

        running ${colors.yellow('npm --init')[0]}
      `)
      await npminit(yes).catch(e => {
        throw e
      })
    break;
  }

  await mutatePackJson(dir).catch(e => {
    throw e
  })

  await git(daisconfig.git, dir).catch(e => {
    throw e
  })

  await installDevDependencies(
    daisconfig.addedDevDependencies,
    daisconfig.ganache,
    daisconfig.packman,
    daisconfig.eslint,
    daisconfig.ethNodeURL,
    dir,
    offline
  ).catch(e => {
    throw e
  })

  await installDependencies(
    contractDeps,
    daisconfig.omitTruffleHdWalletProvider,
    daisconfig.packman,
    daisconfig.addedDependencies,
    offline,
    dir
  ).catch(e => {
    throw e
  })
}

interface IChildProcessReturn {
  code: number | null
  signal: NodeJS.Signals | null
}
/**
 * Runs a command and resolves the promise on
 * close.
 * @param cmd
 * @param args
 * @returns
 */
export async function bootAndWaitForChildProcess(
  cmd: string,
  args: string[],
  cwd?: string,
  stdio = 'inherit' as StdioOptions
): Promise<IChildProcessReturn> {
  const child = spawn(cmd, args, { stdio, cwd })
  return new Promise((resolve, reject) => {
    child.on('error', err => reject(err))
    child.on('close', (code, signal) => resolve({ code, signal }))
  })
}

export async function yarninit(
  yes?: boolean,
  cwd?: string,
  stdio = 'inherit' as StdioOptions
): Promise<IChildProcessReturn> {
  console.log()
  log('Running', ...colors.green('yarn init'))
  console.log()

  const args = ['init']
  if (yes) args.push('-y')

  return bootAndWaitForChildProcess('yarn', args, cwd, stdio).catch(e => {
    throw e
  })
}

export async function npminit(
  yes?: boolean,
  cwd?: string,
  stdio = 'inherit' as StdioOptions
): Promise<void> {
  console.log()
  log('Running', ...colors.green('npm init'))
  console.log()

  const args = ['init']
  if (yes) args.push('-y')

  return bootAndWaitForChildProcess('npm', args, cwd, stdio).then(
    () => {
      /**/
    },
    e => {
      throw e
    }
  )
}

export async function git(
  git: boolean,
  dir: string,
  childWorkingDir?: string
): Promise<void> {
  if (git) {
    console.log()
    log('Running', ...colors.yellow('git init'))
    console.log()

    await writeGitFiles(dir).catch(e => {
      throw e
    })
    // Could run these in a Promise.all() but that causes undefined
    // behaviour if 'writeGitFiles' throws an error
    return bootAndWaitForChildProcess('git', ['init'], childWorkingDir).then(
      () => {
        /***/
      },
      e => {
        throw e
      }
    )
  }

  return
}

/**
 *
 * @param dir
 * @returns
 */
export async function tscInit(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/tsconfig.json'), TS.tsconfig).catch(e => {
    throw e
  })
}

/**
 *
 * @param dir
 * @returns
 */
export async function mutatePackJson(dir: string): Promise<void> {
  dir = pathResolve(dir + '/package.json')
  const packjson = JSON.parse(readFileSync(dir).toString())
  if (packjson.scripts) packjson.scripts.tsc = 'tsc'
  else packjson.scripts = { tsc: 'tsc' }

  packjson.main = '/lib/index.ts'

  return makeFile(dir, JSON.stringify(packjson)).catch(e => {
    throw e
  })
}

/**
 * Installs production dependencies
 * @param contractDeps
 * @param omitTruffleHd
 * @param packman
 * @param addedDeps
 * @returns
 */
export async function installDependencies(
  contractDeps: string[],
  omitTruffleHd: boolean,
  packman: 'yarn' | 'npm',
  addedDeps: string[],
  offline?: boolean,
  cwd?: string
): Promise<IChildProcessReturn> {
  const deps = ['web3', 'dotenv']
  const devInstall = false

  if (!omitTruffleHd) deps.push('@truffle/hdwallet-provider')

  deps.push(...addedDeps)
  deps.push(...contractDeps)

  console.log()
  log('Installing dependencies')
  console.log()

  return runInstallCommands(packman, devInstall, deps, offline, cwd).catch(
    e => {
      throw e
    }
  )
}

/**
 * Installs development dependencies
 * @param addedDevDeps
 * @param ganache
 * @param dir
 * @param packman
 * @param eslint
 */
export async function installDevDependencies(
  addedDevDeps: string[],
  ganache: boolean,
  packman: 'yarn' | 'npm',
  eslint: boolean,
  ethNodeURL: string,
  dir: string,
  offline?: boolean
): Promise<IChildProcessReturn> {
  const devDeps = ['typescript', 'ts-node', '@types/node']
  const devInstall = true

  if (ganache) {
    await writeGanache(dir, ethNodeURL).catch(e => {
      throw e
    })

    devDeps.push('ganache-cli')
  }

  if (eslint) {
    await writeEslintFiles(dir).catch(e => {
      throw e
    })

    devDeps.push(
      ...[
        'eslint',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser'
      ]
    )
  }

  devDeps.push(...addedDevDeps)

  console.log()
  log('Installing dev dependencies')
  console.log()

  return runInstallCommands(packman, devInstall, devDeps, offline, dir).catch(
    e => {
      throw e
    }
  )
}

/**
 * Runs the install commands
 * @param packman
 * @param dev
 * @param deps
 * @returns
 */
export async function runInstallCommands(
  packman: 'yarn' | 'npm',
  dev: boolean,
  deps: string[],
  offline?: boolean,
  cwd?: string,
  stdio = 'inherit' as StdioOptions
): Promise<IChildProcessReturn> {
  const args = ['add', ...deps]
  if (dev) args.push('-D')
  if (offline) args.push('--offline')

  switch (packman) {
    case 'yarn':
      return bootAndWaitForChildProcess('yarn', args, cwd, stdio).catch(e => {
        throw e
      })

    case 'npm':
      return bootAndWaitForChildProcess('npm', args, cwd, stdio).catch(e => {
        throw e
      })

    default:
      log.error('Unsupported package manager')
      log.warning('Attempting yarn add')
      return bootAndWaitForChildProcess('yarn', args, cwd, stdio).then(
        val => val,
        async () => {
          log.error(...colors.red('yarn add'), 'failed.')
          log.warning('Attempting npm i')

          return bootAndWaitForChildProcess('npm', args, cwd, stdio).catch(
            e => {
              throw e
            }
          )
        }
      )
  }
}

/**
 *
 * @param dir
 * @param solver
 * @param contractWriteDir
 * @returns
 */
export async function writeTruffleFiles(
  dir: string,
  solver: string,
  contractWriteDir: string
): Promise<void[]> {
  return Promise.all([
    makeFile(
      pathResolve(dir + '/contracts/Migrations.sol'),
      Truffle.Libraries.Migrations(solver)
    ),

    makeFile(
      pathResolve(dir + '/migrations/1_initial_migration.js'),
      TruffleConfigs.InitialMigrationJS
    ),

    makeFile(
      pathResolve(dir + '/truffle-config.js'),
      TruffleConfigs.TruffleConfig(solver, contractWriteDir)
    )
  ]).catch(e => {
    throw e
  })
}

/**
 *
 * @param dir
 * @param ethNodeURL
 * @returns
 */
export async function writeGanache(
  dir: string,
  ethNodeURL: string
): Promise<void> {
  return makeFile(
    pathResolve(dir + '/fork-chain.js'),
    Ganache.ForkChain(ethNodeURL)
  )
}

/**
 *
 * @param dir
 * @returns
 */
export async function writeEslintFiles(dir: string): Promise<void[]> {
  return Promise.all([
    makeFile(pathResolve(dir + '/.eslintignore'), Eslint.eslintignore),

    makeFile(pathResolve(dir + '/.eslintrc'), Eslint.eslintrc)
  ])
}

/**
 *
 * @param dir
 * @returns
 */
export async function writeGitFiles(dir: string): Promise<void[]> {
  return Promise.all([
    makeFile(pathResolve(dir + '/.gitignore'), Git.gitignore),

    makeFile(pathResolve(dir + '/.gitattributes'), Git.gitattributes)
  ]).catch(e => {
    throw e
  })
}

export async function Init(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/.daisconfig'), DaisConfig)
}

/**
 * Is a promise for error handling purposes
 * @param dir
 * @returns
 */
export async function fetchdaisconfig(dir: string): Promise<IDaisConfig> {
  try {
    return JSON.parse(
      readFileSync(pathResolve(dir + '/.daisconfig')).toString()
    )
  } catch (e) {
    const daisconfig = colors.blue('.daisconfig')[0]
    log.withbox.error(
      `
    ${daisconfig} file is missing
    Run ${colors.green('daisweb3 --init')} to print a 
    template ${daisconfig}
    `,
      50,
      5
    )

    throw e
  }
}
