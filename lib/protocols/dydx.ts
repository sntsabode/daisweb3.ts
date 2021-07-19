import { IContractImport } from '../daisconfig'
import { colors, log, makeFile, untyped } from '../utils'
import { resolve as pathResolve } from 'path'
import { DyDx } from '../files/contracts/__contracts__'
import { NPMPacks } from '../npm-packs'
import { TImports } from './__imports__'

export type SupportedImport =
  'FLASHLOAN'

/**
 * Assumes the `DyDx` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directories
 * @param pack package being imported
 * @param solver solidity version
 */
export const DyDxWriter = async (
  dir: string,
  solver: string,
  ci: IContractImport
): Promise<string> => Imports[(() => {
  const pack = ci.pack.toUpperCase() as SupportedImport
  if (!Imports[pack])
    return 'ERROR'
  return pack
})() as SupportedImport | 'ERROR'](
  dir, solver, ci
).then(
  () => !ci.omitNpmPack ?
    NPMPacks.DYDX.V3Client : '',
  e => { throw e }
)

const Imports: TImports<{
  ERROR: untyped
  FLASHLOAN: untyped
}> = {
  FLASHLOAN: Flashloan,
  ERROR: async (d,s, ci) => {
    log.error(...colors.red(ci.pack), 'is not a valid import')
    return []
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