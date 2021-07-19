import { colors, log, makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'
import { IContractImport, IDaisConfig, SupportedNetwork, SupportedProtocol, SupportedProtocolsArray } from './daisconfig'
import fs from 'fs'
import { BancorWriter } from './protocols/bancor'
import { DyDxWriter } from './protocols/dydx'
import { IWriterReturn } from './protocols/__imports__'

class ProtocolFileWriter {
  static readonly instance = new ProtocolFileWriter()
  private constructor ( ) { /**/ }

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

  readonly main = async (
    dir: string,
    contractImports: IContractImport[],
    solver: string,
    net: SupportedNetwork | 'all'
  ): Promise<IWriterReturn[]> => this.#makeBaseDirs(dir)
    .then(() => this.#work(
    solver, contractImports, dir, net
  ), e => { throw e })

  readonly #work = async (
    solver: string,
    contractImports: IContractImport[],
    dir: string,
    net: SupportedNetwork | 'all'
  ): Promise<IWriterReturn[]> => Promise.all(contractImports.map(
    ci => this.protocols[(() => {
      const protocol = ci.protocol.toUpperCase() as SupportedProtocol
      if (!this.protocols[protocol])
        return 'ERROR' 
      return protocol
    })() as SupportedProtocol | 'ERROR'](
      dir, solver, net, ci
    ).catch(e => { throw e })
  ))

  readonly #bancor = async (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    ci: IContractImport
  ): Promise<IWriterReturn> => {
    // Is promise.all because the libraries dir can also be made
    // here when it's needed
    if (!this.#madeDirs.BANCOR) await Promise.all([
      makeDir(pathResolve(dir + '/contracts/interfaces/Bancor'))
    ]).then(
      () => this.#madeDirs.BANCOR = true,
      e => { throw e }
    )

    return BancorWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

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

    return DyDxWriter(dir, solver, net, ci)
      .catch(e => { throw e })
  }

  readonly protocols: {
    readonly [protocol in SupportedProtocol]: (
      dir: string,
      solver: string,
      net: SupportedNetwork | 'all',
      ci: IContractImport
    ) => Promise<IWriterReturn>
  } & {
    readonly ERROR: (
      dir: string, solver: string, 
      net: SupportedNetwork | 'all',
      ci: IContractImport
    ) => Promise<IWriterReturn>
  }= {
    BANCOR: this.#bancor,
    DYDX: this.#dydx,
    KYBER: async (dir, solver, ci) => ({
      ABIs: [], Addresses: [], Pack: ''
    }),
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

  readonly #makeBaseDirs = async (
    dir: string
  ): Promise<void[]> => Promise.all([
    makeDir(pathResolve(dir + '/contracts/interfaces')),
    makeDir(pathResolve(dir + '/contracts/libraries'))
  ]).catch(e => { throw e })
}

export async function Assemble(dir: string): Promise<void> {
  const daisconfig = await fetchdaisconfig(dir)
    .catch(e => { throw e })
  
  const contractDeps = await ProtocolFileWriter.instance.main(
    dir, 
    daisconfig.contractImports, 
    daisconfig.solversion,
    daisconfig.defaultNet
  )

  log(contractDeps)
}

export async function Init(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/.daisconfig'), DaisConfig)
}

async function fetchdaisconfig(dir: string): Promise<IDaisConfig> {
  return JSON.parse(
    fs.readFileSync(pathResolve(dir + '/.daisconfig')).toString()
  )
}