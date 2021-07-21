import { colors, log, makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'
import { IContractImport, IDaisConfig, SupportedNetwork, SupportedProtocol, SupportedProtocolsArray } from './daisconfig'
import { BancorWriter } from './protocols/bancor'
import { DyDxWriter } from './protocols/dydx'
import { IWriterReturn } from './protocols/__imports__'
import { KyberWriter } from './protocols/kyber'
import { OpenZeppelin, Truffle } from './files/contracts/__contracts__'
import { spawn } from 'node:child_process'
import { Eslint, Ganache, Git, TS } from './files/configs/__configs__'
import { OneInchWriter } from './protocols/oneinch'
import { UniswapWriter } from './protocols/uniswap'
import { Truffle as TruffleConfigs } from './files/configs/__configs__'
import { readFileSync } from 'fs'

/**
 * The type used in `ProtocolFileWriter.#addresses`
 */
type ProtocolFileWriterAddresses = {
  [protocol in SupportedProtocol]: {
    [net in SupportedNetwork]: {
      ContractName: string
      Address: string
    }[]
  }
} & {
  ERROR: {
    [net in SupportedNetwork]: {
      ContractName: string
      Address: string
    }[]
  }
}

/**
 * Type signature for the writer functions in 
 * `ProtocolFileWriter.protocols`
 */
type ProtocolWriterFunc = (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  ci: IContractImport
) => Promise<IWriterReturn>

/**
 * Type signature for `ProtocolFileWriter.protocols`
 */
type ProtocolWriters = {
  [protocol in SupportedProtocol]: ProtocolWriterFunc
} & {
  ERROR: ProtocolWriterFunc
}

/**
 * Temporary
 *
 * Make OpenZeppelin a SupportedImport and treat making the directories the
 * same as with the other protocols
 */
const WriteIERC20 = async (
  dir: string,
  solver: string
) => makeFile(pathResolve(
  dir + '/contracts/interfaces/@OpenZeppelin/IERC20.sol'
), OpenZeppelin.Interfaces.IERC20(solver)).catch(
  async e => {
    if (e.code !== 'ENOENT') throw e

    await makeDir(pathResolve(dir + '/contracts/interfaces/@OpenZeppelin'))
      .catch(e => { throw e })

    return makeFile(pathResolve(
      dir + '/contracts/interfaces/@OpenZeppelin/IERC20.sol'
    ), OpenZeppelin.Interfaces.IERC20(solver))
      .catch(e => { throw e })
  }
)

/**
 * This class is responsible for handling the **contractImports** section
 * of the **.daisconfig** file. It delegates work to the Writer functions which
 * further delegate the work to the respective functions responsible for writing the
 * Solidity files. Those functions then return the ABIs and Addresses needed to be written.
 * Those return values are stored in `#abis` and `#addresses`
 * 
 * Once the file Writer promise is resolved the stored abis and addresses
 * are written to *abi.ts* and *addresses.ts* files in the directory.
 * 
 * The process ends with an array of dependencies collected from all the imports made in the 
 * `contractImports` section of the `.daisconfig` file being returned by `ProtocolFileWriter.main`
 */
class ProtocolFileWriter {
  static readonly instance = new ProtocolFileWriter()
  private constructor() { /**/ }

  /**
   * Flag to make sure IERC20.sol is written only once
   */
  #wroteIERC20 = false
  readonly #writeIERC20 = async (
    dir: string,
    solver: string
  ) => {
    if (!this.#wroteIERC20) await WriteIERC20(
      dir, solver
    ).then(
      () => this.#wroteIERC20 = true,
      e => { throw e }
    )
  }

  /**
   * Flags to make sure the same directory isn't tried to be 
   * made more than once
   */
  readonly #madeDirs: {
    [protocol in SupportedProtocol]: boolean
  } = (function () {
    const protocolObject = <{
      [protocol in SupportedProtocol]: boolean
    }>{}
    for (const protocol of SupportedProtocolsArray)
      protocolObject[protocol] = false
    return protocolObject
  })()

  /**
   * An object of arrays holding the addresses for the contracts
   * written. These addresses are the addresses going to be written
   * in the `/lib/addresses.ts` file
   */
  readonly #addresses: ProtocolFileWriterAddresses = (function () {
    const obj: ProtocolFileWriterAddresses = <unknown>{} as ProtocolFileWriterAddresses
    for (const protocol of SupportedProtocolsArray)
      obj[protocol] = {
        MAINNET: [], KOVAN: [], ROPSTEN: []
      }
    obj['ERROR'] = {
      MAINNET: [], KOVAN: [], ROPSTEN: []
    }

    return obj
  })()

  /**
   * An object of arrays holding the abis required in the **.daisconfig**
   * file. These abis are the abis going to be used to build the abis
   * file going to be written in `/lib/abis.ts`
   * 
   * @todo Duplicate ABIs are written into the abis file if many different
   * imports depend on the one abi. Fix 
   */
  readonly #abis: {
    [protocol in SupportedProtocol]: Set<string>
  } & {
    ERROR: Set<string>
  } = (function () {
    const obj = <
      { [protocol in SupportedProtocol]: Set<string> } &
      { ERROR: Set<string> }
      >{}

    for (const protocol of SupportedProtocolsArray)
      obj[protocol] = new Set()
    obj.ERROR = new Set()
    return obj
  })()

  /**
   * Main contract writer entry point
   * @param dir 
   * @param contractImports 
   * @param solver 
   * @param net 
   * @returns An array of dependencies meant to be installed,
   * declared in the `contractImports` section of the `.daisconfig`
   * file
   */
  readonly main = async (
    dir: string,
    contractImports: IContractImport[],
    solver: string,
    net: SupportedNetwork | 'all'
  ): Promise<string[]> => makeBaseDirs(dir)
    .then(() => this.#work(
      solver, contractImports, dir, net
    ), e => { throw e }).then(
      (val) => Promise.all([
        this.#buildABIFile(dir),
        this.#buildAddressesFile(dir)
      ]).then(
        () => this.#makeDependenciesArray(val),
        e => { throw e }
      ),

      e => { throw e }
    )

  readonly #makeDependenciesArray = (
    depsParam: string[][]
  ): string[] => {
    const deps: string[] = []
    for (const depsArray of depsParam)
      for (const dep of depsArray)
        if (dep) deps.push(dep)

    return deps
  }

  /**
   * Loops through the `contractImports` param and calls the respective
   * Writer function. 
   * 
   * The function then returns the abis if any (parameter is
   * set in the **.daiscongig** file), it also returns the addresses for the 
   * contracts written. These values are then pushed into their respective arrays
   * in `#abis` and `#addresses`.
   * 
   * Along with the abis and addresses the Writer function also returns the 
   * npm package if any (parameter is set in the **.daisconfig** file).
   * 
   * The npm package strings will then be returned by this `#work` method.
   * These dependencies are going to be installed along the standard dependencies
   * on the call to *yarn add* or *npm i*
   * @param solver 
   * @param contractImports 
   * @param dir 
   * @param net
   * @returns 
   */
  readonly #work = async (
    solver: string,
    contractImports: IContractImport[],
    dir: string,
    net: SupportedNetwork | 'all'
  ): Promise<string[][]> => Promise.all(contractImports.map(
    ci => {
      let protocol = <SupportedProtocol | 'ERROR'>ci.protocol.toUpperCase()
      protocol = !this.protocols[protocol] ? 'ERROR' : protocol
      return this.protocols[protocol](
        dir, solver, net, ci
      ).then(val => {
        val.ABIs.forEach(abi => this.#abis[protocol].add(abi.ABI))

        val.Addresses.forEach(({ NET, ...data }) => {
          if (this.#addresses[protocol][NET].some(
            ({ ...dat }) => dat.Address === data.Address
          )) return

          this.#addresses[protocol][NET].push({
            ContractName: data.ContractName,
            Address: data.Address
          })
        })

        return val.Pack
      }, e => { throw e })
    }
  ))

  /**
   * Builds the `abis.ts` file according to the abis selected in the
   * **.daisconfig** then writes it into `dir`
   * @param dir 
   * @returns 
   */
  readonly #buildABIFile = async (
    dir: string
  ) => {
    let ABIfile = ''
    for (const [protocol, abis] of Object.entries(this.#abis)) {
      if (
        abis.size === 0
        || protocol === 'ERROR'
      ) continue

      ABIfile += `\nexport const ${protocol}_ABI = {`
      for (const abi of abis)
        ABIfile += '\n  ' + abi + ','

      ABIfile += '\n}'
    }

    return makeFile(pathResolve(dir + '/lib/abis.ts'), ABIfile.trim())
      .catch(e => { throw e })
  }

  /**
   * Builds the `addresses.ts` file according to the contracts selected in 
   * the **.daisconfig** then writes it into `dir`
   * @param dir 
   * @returns 
   */
  readonly #buildAddressesFile = async (
    dir: string
  ) => {
    let AddressesFile = 'export const Addresses = {'
    for (const [protocol, networks] of Object.entries(this.#addresses)) {
      if (
        protocol === 'ERROR'
        || this.#addresses[<SupportedProtocol>protocol].MAINNET.length === 0
        && this.#addresses[<SupportedProtocol>protocol].KOVAN.length === 0
        && this.#addresses[<SupportedProtocol>protocol].ROPSTEN.length === 0
      ) continue

      AddressesFile += `\n  ${protocol}: {`

      for (const [net, addresses] of Object.entries(networks)) {
        if (addresses.length === 0) continue
        AddressesFile += `\n    ${net}: {`

        for (const address of addresses) {
          AddressesFile += `\n      ${address.ContractName}: '${address.Address}',`
        }

        AddressesFile += `\n    },`
      }

      AddressesFile += `\n  },\n`
    }

    AddressesFile += '\n}'

    return makeFile(pathResolve(
      dir + '/lib/addresses.ts'
    ), AddressesFile.trim())
      .catch(e => { throw e })
  }

  /**
   * Called for every BANCOR import
   * @param dir 
   * @param solver 
   * @param net 
   * @param ci 
   * @returns 
   */
  readonly #bancor = async (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    ci: IContractImport
  ): Promise<IWriterReturn> => {
    if (!this.#madeDirs.BANCOR) await makeDir(pathResolve(
      dir + '/contracts/interfaces/Bancor'
    )).then(
      () => this.#madeDirs.BANCOR = true,
      e => { throw e }
    )

    await this.#writeIERC20(dir, solver)
      .catch(e => { throw e })

    return BancorWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  /**
   * Called for every DYDX import
   * @param dir 
   * @param solver 
   * @param net 
   * @param ci 
   * @returns 
   */
  readonly #dydx = async (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    ci: IContractImport
  ): Promise<IWriterReturn> => {
    if (!this.#madeDirs.DYDX) await Promise.all([
      makeDir(pathResolve(dir + '/contracts/interfaces/DyDx')),
      makeDir(pathResolve(dir + '/contracts/libraries/DyDx'))
    ]).then(
      () => this.#madeDirs.DYDX = true,
      e => { throw e }
    )

    await this.#writeIERC20(dir, solver)
      .catch(e => { throw e })

    return DyDxWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  /**
   * Called for every KYBER import
   * @param dir 
   * @param solver 
   * @param net 
   * @param ci 
   * @returns 
   */
  readonly #kyber = async (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    ci: IContractImport
  ) => {
    if (!this.#madeDirs.KYBER) await Promise.all([
      makeDir(pathResolve(dir + '/contracts/interfaces/Kyber'))
    ]).then(
      () => this.#madeDirs.KYBER = true,
      e => { throw e }
    )

    await this.#writeIERC20(dir, solver)
      .catch(e => { throw e })

    return KyberWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  /**
   * Called for every ONEINCH import
   * @param dir 
   * @param solver 
   * @param net 
   * @param ci 
   * @returns 
   */
  readonly #oneinch = async (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    ci: IContractImport
  ): Promise<IWriterReturn> => {
    if (!this.#madeDirs.ONEINCH) await makeDir(pathResolve(
      dir + '/contracts/interfaces/OneInch'
    )).then(
      () => this.#madeDirs.ONEINCH = true,
      e => { throw e }
    )

    await this.#writeIERC20(dir, solver)
      .catch(e => { throw e })

    return OneInchWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  /**
   * Called for every Uniswap import
   * @param dir 
   * @param solver 
   * @param net 
   * @param ci 
   * @returns 
   */
  readonly #uniswap = async (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    ci: IContractImport
  ) => {
    if (!this.#madeDirs.UNISWAP) await makeDir(pathResolve(
      dir + '/contracts/interfaces/Uniswap'
    )).then(
      () => this.#madeDirs.UNISWAP = true,
      e => { throw e }
    )

    return UniswapWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  public readonly protocols: ProtocolWriters = {
    BANCOR: this.#bancor,
    DYDX: this.#dydx,
    KYBER: this.#kyber,
    ONEINCH: this.#oneinch,
    UNISWAP: this.#uniswap,
    ERROR: async (d, s, n, ci) => {
      log.error('---', ...colors.red(ci.protocol), 'is not a supported protocol')

      return {
        ABIs: [], Addresses: [], Pack: ['']
      }
    }
  }
}

/**
 * Makes the directories the writer functions have to work in
 * @param dir 
 * @returns 
 */
const makeBaseDirs = async (
  dir: string
): Promise<void[]> => Promise.all([
  makeDir(pathResolve(dir + '/contracts/interfaces')),
  makeDir(pathResolve(dir + '/contracts/libraries')),
  makeDir(pathResolve(dir + '/lib')),
  makeDir(pathResolve(dir + '/migrations'))
]).catch(e => { throw e })

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
async function bootAndWaitForChildProcess(
  cmd: string,
  args: string[]
): Promise<IChildProcessReturn> {
  const child = spawn(cmd, args, { stdio: 'inherit' })
  return new Promise((resolve, reject) => {
    child.on('error', err => reject(err))
    child.on('close', (code, signal) => resolve(
      { code, signal }
    ))
  })
}

async function npminit(): Promise<void> {
  console.log()
  log('Running', ...colors.yellow('npm init'))
  console.log()
  return bootAndWaitForChildProcess('npm', ['init'])
    .then(
      () => {/**/ },
      e => { throw e }
    )
}

async function git(git: boolean, dir: string): Promise<void> {
  if (git) {
    console.log()
    log('Running', ...colors.yellow('git init'))
    console.log()

    await writeGitFiles(dir)
      .catch(e => { throw e })
    // Could run these in a Promise.all() but that causes undefined
    // behaviour if 'writeGitFiles' throws an error
    return bootAndWaitForChildProcess('git', ['init'])
      .then(
        () => {/***/ },
        e => { throw e }
      )
  }

  return
}

/**
 * Main function
 * 
 * Builds the boilerplate in accordance with the options entered in 
 * the **.daisconfig** file
 * @param dir 
 */
export async function Assemble(dir: string): Promise<void> {
  const daisconfig = await fetchdaisconfig(dir)
    .catch(e => { throw e })

  // It's best these run sequentially

  const contractDeps = await ProtocolFileWriter.instance.main(
    dir,
    daisconfig.contractImports,
    daisconfig.solversion,
    daisconfig.defaultNet
  ).catch(e => { throw e })

  await Promise.all([
    writeTruffleFiles(dir,
      daisconfig.solversion,
      daisconfig.contractWriteDir
    ),

    tscInit(dir)
  ]).catch(e => { throw e })

  await npminit()
    .catch(e => { throw e })

  await addTscTopackjson(dir)
    .catch(e => { throw e })

  await git(daisconfig.git, dir)
    .catch(e => { throw e })

  await installDevDependencies(
    daisconfig.addedDevDependencies,
    daisconfig.ganache,
    daisconfig.packman,
    daisconfig.eslint,
    daisconfig.ethNodeURL,
    dir
  ).catch(e => { throw e })

  await installDependencies(
    contractDeps,
    daisconfig.omitTruffleHdWalletProvider,
    daisconfig.packman,
    daisconfig.addedDependencies
  ).catch(e => { throw e })
}

/**
 * 
 * @param dir 
 * @returns 
 */
export async function tscInit(dir: string): Promise<void> {
  return makeFile(pathResolve(
    dir + '/tsconfig.json'
  ), TS.tsconfig).catch(
    e => { throw e }
  )
}

/**
 * 
 * @param dir 
 * @returns 
 */
export async function addTscTopackjson(dir: string): Promise<void> {
  dir = pathResolve(dir + '/package.json')
  const packjson = JSON.parse(readFileSync(dir).toString())
  packjson.scripts.tsc = 'tsc'
  packjson.main = '/lib/index.ts'

  return makeFile(dir, JSON.stringify(packjson))
    .catch(e => { throw e })
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
  addedDeps: string[]
): Promise<IChildProcessReturn> {
  const deps = ['web3', 'dotenv']

  if (!omitTruffleHd) deps.push(
    '@truffle/hdwallet-provider'
  )

  deps.push(...addedDeps)
  deps.push(...contractDeps)

  console.log()
  log('Installing dependencies')
  console.log()

  return runInstallCommands(
    packman, false, deps
  ).catch(e => { throw e })
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
  dir: string
): Promise<IChildProcessReturn> {
  const devDeps = ['typescript', 'ts-node']

  if (ganache) {
    await writeGanache(dir, ethNodeURL)
      .catch(e => { throw e })

    devDeps.push('ganache-cli')
  }

  if (eslint) {
    await writeEslintFiles(dir)
      .catch(e => { throw e })

    devDeps.push(...[
      'eslint',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser'
    ])
  }

  devDeps.push(...addedDevDeps)

  console.log()
  log('Installing dev dependencies')
  console.log()

  return runInstallCommands(
    packman, true, devDeps
  ).catch(e => { throw e })
}

/**
 * Runs the install commands
 * @param packman 
 * @param dev 
 * @param deps 
 * @returns 
 */
async function runInstallCommands(
  packman: 'yarn' | 'npm',
  dev: boolean,
  deps: string[]
) {
  const args = ['add', ...deps]
  if (dev) args.push('-D')

  switch (packman) {
    case 'yarn':
      return bootAndWaitForChildProcess('yarn', args)
        .catch(e => { throw e })

    case 'npm':
      return bootAndWaitForChildProcess('npm', args)
        .catch(e => { throw e })

    default:
      log.error('Unsupported package manager')
      log.warning('Attempting yarn add')
      return bootAndWaitForChildProcess('yarn', [
        'add',
        ...deps
      ]).then(val => val, () => {
        log.error(...colors.red('yarn add'), 'failed.')
        log.warning('Attempting npm i')

        return bootAndWaitForChildProcess('npm', args)
          .catch(e => { throw e })
      })
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
    makeFile(pathResolve(
      dir + '/contracts/Migrations.sol'
    ), Truffle.Libraries.Migrations(solver)),

    makeFile(pathResolve(
      dir + '/migrations/1_initial_migration.js'
    ), TruffleConfigs.InitialMigrationJS),

    makeFile(pathResolve(
      dir + '/truffle-config.js'
    ), TruffleConfigs.TruffleConfig(solver, contractWriteDir))
  ]).catch(e => { throw e })
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
  return makeFile(pathResolve(
    dir + '/fork-chain.js'
  ), Ganache.ForkChain(ethNodeURL))
}

/**
 * 
 * @param dir 
 * @returns 
 */
export async function writeEslintFiles(dir: string): Promise<void[]> {
  return Promise.all([
    makeFile(pathResolve(
      dir + '/.eslintignore'
    ), Eslint.eslintignore),

    makeFile(pathResolve(
      dir + '/.eslintrc'
    ), Eslint.eslintrc)
  ])
}

/**
 * 
 * @param dir 
 * @returns 
 */
export async function writeGitFiles(dir: string): Promise<void[]> {
  return Promise.all([
    makeFile(pathResolve(
      dir + '/.gitignore'
    ), Git.gitignore),

    makeFile(pathResolve(
      dir + '/.gitattributes'
    ), Git.gitattributes)
  ]).catch(e => { throw e })
}

export async function Init(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/.daisconfig'), DaisConfig)
}

/**
 * Is a promise for error handling purposes
 * @param dir 
 * @returns 
 */
async function fetchdaisconfig(dir: string): Promise<IDaisConfig> {
  return JSON.parse(
    readFileSync(pathResolve(dir + '/.daisconfig')).toString()
  )
}