import { IContractImport } from '../daisconfig'
import { colors, log, makeFile } from '../utils'
import { resolve as pathResolve } from 'path'
import { DyDx } from '../files/contracts/__contracts__'
import { NPMPacks } from '../npm-packs'

export type SupportedImport =
  'FLASHLOAN'

/**
 * Assumes the `DyDx` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directories
 * @param pack package being imported
 * @param solver solidity version
 */
export async function DyDxWriter(
  dir: string,
  solver: string,
  ci: IContractImport
): Promise<string> {
  switch(ci.pack.toUpperCase() as SupportedImport) {
    case 'FLASHLOAN':
      return Flashloan(dir, solver)
        .then(
          () => !ci.omitNpmPack ?
            NPMPacks['DYDX']['V3Client'] : '',
          e => { throw e }
        )

    default:
      log.error(ci.pack, 'is not a valid', ...colors.red('DyDx'), 'import')
      return ''
  }
}

async function Flashloan(
  dir: string,
  solver: string
): Promise<void[]> {
  return Promise.all([
    makeFile(pathResolve(
      dir + '/contracts/Flashloan.sol'
    ), DyDx.Libraries.FlashloanBoilerplate(solver)),

    makeFile(pathResolve(
      dir + '/contracts/interfaces/DyDx/ICallee.sol'
    ), DyDx.Interfaces.ICallee(solver)),

    makeFile(pathResolve(
      dir + '/contracts/interfaces/DyDx/ISoloMargin.sol'
    ), DyDx.Interfaces.ISoloMargin(solver)),

    makeFile(pathResolve(
      dir + '/contracts/libraries/DyDx/Account.sol'
    ), DyDx.Libraries.Account(solver)),

    makeFile(pathResolve(
      dir + '/contracts/libraries/DyDx/Actions.sol'
    ), DyDx.Libraries.Actions(solver)),

    makeFile(pathResolve(
      dir + '/contracts/libraries/DyDx/Types.sol'
    ), DyDx.Libraries.Types(solver))
  ]).catch(e => { throw e })
}