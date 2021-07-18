import { colors, log, makeFile } from '../utils'
import { resolve as pathResolve } from 'path'
import { Bancor } from '../files/contracts/__contracts__'
import { IContractImport } from '../daisconfig'
import { NPMPacks } from '../npm-packs'

export type SupportedImport =
  'IBANCORNETWORK' 

/**
 * Assumes the `Bancor` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directories
 * @param pack package being imported
 * @param solver solidity version
 */
export async function BancorWriter(
  dir: string,
  solver: string,
  ci: IContractImport
): Promise<string> {
  switch(ci.pack.toUpperCase() as SupportedImport) {
    case 'IBANCORNETWORK':
      return IBancorNetwork(dir, solver)
        .then(
          () => !ci.omitNpmPack ?
            NPMPacks['BANCOR']['SDK'] : '',
          e => { throw e }
        )

    default:
      log.error(ci.pack, 'is not a vaild', ...colors.red('Bancor'), 'import')
      return ''
  }
}

async function IBancorNetwork(
  dir: string,
  solver: string
): Promise<void[]> {
  return Promise.all([
    makeFile(pathResolve(
      dir + '/contracts/interfaces/Bancor/IBancorNetwork.sol'
    ), Bancor.Interfaces.IBancorNetwork(solver)),

    makeFile(pathResolve(
      dir + '/contracts/interfaces/Bancor/IContractRegistry.sol'
    ), Bancor.Interfaces.IContractRegistry(solver))
  ]).catch(e => { throw e })
}