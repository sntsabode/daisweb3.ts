import { colors, log, makeFile, untyped } from '../utils'
import { resolve as pathResolve } from 'path'
import { Bancor } from '../files/contracts/__contracts__'
import { IContractImport } from '../daisconfig'
import { NPMPacks } from '../npm-packs'
import { TImports } from './__imports__'

export type SupportedImport =
  'IBANCORNETWORK' 

/**
 * Assumes the `Bancor` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directories
 * @param pack package being imported
 * @param solver solidity version
 */
export const BancorWriter = async (
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
    NPMPacks.BANCOR.SDK : '',
  e => { throw e }
)

const Imports: TImports<{
  ERROR: untyped
  IBANCORNETWORK: untyped
}>  = {
  IBANCORNETWORK: IBancorNetwork,
  ERROR: async (d,s, ci) => {
    log.error(...colors.red(ci.pack), 'is not a valid Bancor import')
    return []
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