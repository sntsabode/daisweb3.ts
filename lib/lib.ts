import { colors, log, makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'
import { IContractImport, IDaisConfig, SupportedNetwork, SupportedProtocol, SupportedProtocolsArray } from './daisconfig'
import fs from 'fs'
import { BancorWriter } from './protocols/bancor'
import { DyDxWriter } from './protocols/dydx'
import { IABIReturn, IWriterReturn } from './protocols/__imports__'
import { KyberWriter } from './protocols/kyber'
import { OpenZeppelin } from './files/contracts/__contracts__'
import { spawn } from 'node:child_process'
import { Git } from './files/configs/__configs__'

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

type ProtocolWriterFunc = (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  ci: IContractImport
) => Promise<IWriterReturn>

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
  private constructor ( ) { /**/ }

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
   */
  readonly #abis: {
    [protocol in SupportedProtocol]: IABIReturn[]
  } & {
    ERROR: IABIReturn[]
  } = (function () {
    const obj = <
      { [protocol in SupportedProtocol]: IABIReturn[] } &
      { ERROR: IABIReturn[] }
    >{}

    for (const protocol of SupportedProtocolsArray)
      obj[protocol] = []
    obj.ERROR = []
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
      () => [...new Set(val)],
      e => { throw e }
    ),

    e => { throw e }
  )

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
  ): Promise<string[]> => Promise.all(contractImports.map(
    ci => {
      let protocol = <SupportedProtocol | 'ERROR'>ci.protocol.toUpperCase()
      protocol = !this.protocols[protocol] ? 'ERROR' : protocol
      return this.protocols[protocol](
        dir, solver, net, ci
      ).then(val => {
        this.#abis[protocol].push(
          ...val.ABIs
        )
  
        val.Addresses.forEach(address => {
          this.#addresses[protocol][address.NET].push({
            ContractName: address.ContractName,
            Address: address.Address
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
        abis.length === 0
        || protocol === 'ERROR'
      ) continue
      
      ABIfile += `\nexport const ${protocol}_ABI = {`
      for (const abi of abis)
        ABIfile += '\n  ' + abi.ABI + ','

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

    this.#writeIERC20(dir, solver)
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

    this.#writeIERC20(dir, solver)
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

    this.#writeIERC20(dir, solver)
      .catch(e => { throw e })

    return KyberWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  readonly protocols: ProtocolWriters = {
    BANCOR: this.#bancor,
    DYDX: this.#dydx,
    KYBER: this.#kyber,
    ONEINCH: async (dir, solver, ci) => ({
      ABIs: [], Addresses: [], Pack: ''
    }),
    UNISWAP: async (dir, solver, ci) => ({
      ABIs: [], Addresses: [], Pack: ''
    }),
    ERROR: async (d,s,n, ci) => {
      log.error('---', ...colors.red(ci.protocol), 'is not a supported protocol')
      return {
        ABIs: [], Addresses: [], Pack: ''
      }
    }
  }
}

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

export async function Assemble(dir: string): Promise<void> {
  const daisconfig = await fetchdaisconfig(dir)
    .catch(e => { throw e })
  
  const contractDeps = await ProtocolFileWriter.instance.main(
    dir, 
    daisconfig.contractImports, 
    daisconfig.solversion,
    daisconfig.defaultNet
  ).catch(e => { throw e })

  log('Running', ...colors.yellow('npm init'))
  console.log()
  await bootAndWaitForChildProcess('npm', ['init'])
    .catch(e => { throw e })

  if (daisconfig.git) {
    log('Running', ...colors.yellow('git init'))
    console.log()
    writeGitFiles(dir)
      .catch(e => { throw e })

    await bootAndWaitForChildProcess('git', ['init'])
      .catch(e => { throw e })
  }

  log(contractDeps)
}

async function writeGitFiles(dir: string) {
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

async function fetchdaisconfig(dir: string): Promise<IDaisConfig> {
  return JSON.parse(
    fs.readFileSync(pathResolve(dir + '/.daisconfig')).toString()
  )
}