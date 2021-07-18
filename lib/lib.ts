import { makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'
import { IContractImport, IDaisConfig } from './daisconfig'
import fs from 'fs'

class ProtocolFileWriter {
  static instance = new ProtocolFileWriter()
  private constructor ( ) { /**/ }

  async main(
    dir: string,
    contractImports: IContractImport[]
  ): Promise<void> {
    await this.#makeBaseDirs(dir)
    return this.#work(contractImports)
  }

  #work = async (
    contractImports: IContractImport[]
  ) => {
    contractImports.map(ci => {
      switch(ci.protocol) {
        case 'BANCOR':

        break;

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
  
  ProtocolFileWriter.instance.main(dir, daisconfig.contractImports)
}

export async function Init(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/.daisconfig'), DaisConfig)
}

async function fetchdaisconfig(dir: string): Promise<IDaisConfig> {
  return JSON.parse(
    fs.readFileSync(pathResolve(dir + '/.daisconfig')).toString()
  )
}