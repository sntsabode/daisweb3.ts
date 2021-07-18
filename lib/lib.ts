import { makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { DaisConfig } from './files/daisconfig'

class ProtocolFileWriter {
  static instance = new ProtocolFileWriter()
  private constructor ( ) { /**/ }

  async main(dir: string) {
    await this.#makeBaseDirs(dir)
  }

  #makeBaseDirs = async (
    dir: string
  ) => Promise.all([
    makeDir(pathResolve(dir + '/contracts/interfaces')),
    makeDir(pathResolve(dir + '/contracts/libraries'))
  ])
}

export async function Assemble(dir: string): Promise<void> {
  ProtocolFileWriter.instance.main(dir)
}

export async function Init(dir: string): Promise<void> {
  return makeFile(pathResolve(dir + '/.daisconfig'), DaisConfig)
}