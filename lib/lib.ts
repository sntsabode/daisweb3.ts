import { makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'
import { IContractImport, IDaisConfig, SupportedProtocol, SupportedProtocolsArray } from './daisconfig'
import fs from 'fs'
import { BancorWriter } from './protocols/bancor'

class ProtocolFileWriter {
  static readonly instance = new ProtocolFileWriter()
  private constructor ( ) { /**/ }

  readonly #madeDirs: {
    [protocol in SupportedProtocol]: boolean
  } = (function () {
    const protocolObject = <{ [protocol in SupportedProtocol]: boolean }>{}
    for (const protocol of SupportedProtocolsArray)
      protocolObject[protocol] = false
    return protocolObject
  })()

  async main(
    dir: string,
    contractImports: IContractImport[],
    solver: string
  ): Promise<void> {
    await this.#makeBaseDirs(dir)
    return this.#work(solver, contractImports, dir)
      .catch(e => { throw e })
  }

  #work = async (
    solver: string,
    contractImports: IContractImport[],
    dir: string
  ) => {
    contractImports.map(ci => {
      switch(ci.protocol.toUpperCase()) {
        case 'BANCOR':
          return this.#bancor(
            dir, solver, ci
          )

        case 'DYDX':

        break;

        case 'KYBER':

        break;

        case 'ONEINCH':

        break;

        case 'UNISWAP':

        break;
      }
    })
  }

  #bancor = async (
    dir: string,
    solver: string,
    ci: IContractImport
  ) => {
    // Is promise.all because the libraries dir can also be made
    // here when it's needed
    if (!this.#madeDirs.BANCOR) await Promise.all([
      makeDir(pathResolve(dir + '/contracts/interfaces/Bancor'))
    ]).then(
      () => this.#madeDirs.BANCOR = true,
      e => { throw e }
    )

    return BancorWriter(solver, ci)
    .catch(e => { throw e })
  }

  #makeBaseDirs = async (
    dir: string
  ) => Promise.all([
    makeDir(pathResolve(dir + '/contracts/interfaces')),
    makeDir(pathResolve(dir + '/contracts/libraries'))
  ])
}

export async function Assemble(dir: string): Promise<void> {
  const daisconfig = await fetchdaisconfig(dir)
    .catch(e => { throw e })
  
  ProtocolFileWriter.instance.main(
    dir, daisconfig.contractImports, daisconfig.solversion
  )
}

export async function Init(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/.daisconfig'), DaisConfig)
}

async function fetchdaisconfig(dir: string): Promise<IDaisConfig> {
  return JSON.parse(
    fs.readFileSync(pathResolve(dir + '/.daisconfig')).toString()
  )
}