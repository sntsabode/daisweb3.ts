/** @format */

import { IContractImport, SupportedNetwork } from '../daisconfig'
import { colors, log, makeFile } from '../utils'
import { resolve as pathResolve } from 'path'
import { DyDx } from '../files/contracts/__contracts__'
import { NPMPacks } from '../npm-packs'
import { IWriterReturn, TImports } from './__imports__'
import { Addresses } from '../addresses'

export type SupportedImport = 'FLASHLOAN'

// prettier-ignore
/**
 * Assumes the `DyDx` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directories
 * @param pack package being imported
 * @param solver solidity version
 */
export const DyDxWriter = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  ci: IContractImport
): Promise<IWriterReturn> => Imports[
  (() => {
    const pack = ci.pack.toUpperCase() as SupportedImport
    if (!Imports[pack]) return 'ERROR'
    return pack
  })()
](dir, solver, net, ci.abi, ci.omitNpmPack, ci.pack)
  .catch(e => { throw e })

// prettier-ignore
const Flashloan = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  omitNpmPack: boolean
): Promise<IWriterReturn> => Promise.all([
  makeFile(
    pathResolve(dir + '/contracts/Flashloan.sol'),
    DyDx.Libraries.FlashloanBoilerplate(solver)
  ),

  makeFile(
    pathResolve(dir + '/contracts/interfaces/DyDx/ICallee.sol'),
    DyDx.Interfaces.ICallee(solver)
  ),

  makeFile(
    pathResolve(dir + '/contracts/interfaces/DyDx/ISoloMargin.sol'),
    DyDx.Interfaces.ISoloMargin(solver)
  ),

  makeFile(
    pathResolve(dir + '/contracts/libraries/DyDx/Account.sol'),
    DyDx.Libraries.Account(solver)
  ),

  makeFile(
    pathResolve(dir + '/contracts/libraries/DyDx/Actions.sol'),
    DyDx.Libraries.Actions(solver)
  ),

  makeFile(
    pathResolve(dir + '/contracts/libraries/DyDx/Types.sol'),
    DyDx.Libraries.Types(solver)
  )
]).then(
  () => ({
    Addresses:
      net === 'all'
        ? [
            {
              NET: 'KOVAN',
              ContractName: 'ISoloMargin',
              Address: Addresses.DYDX.ISoloMargin.KOVAN
            },
            {
              NET: 'ROPSTEN',
              ContractName: 'ISoloMargin',
              Address: Addresses.DYDX.ISoloMargin.ROPSTEN
            },
            {
              NET: 'MAINNET',
              ContractName: 'ISoloMargin',
              Address: Addresses.DYDX.ISoloMargin.MAINNET
            }
          ]
        : [
            {
              NET: net,
              ContractName: 'ISoloMargin',
              Address: Addresses.DYDX.ISoloMargin[net]
            }
          ],

    ABIs: abi
      ? [
          {
            ContractName: 'ISoloMargin',
            // Find ABI
            ABI: ''
          }
        ]
      : [],

    Pack: (() => {
      if (omitNpmPack)
        return []
      return NPMPacks.DYDX.V3Client
    })()
  }),
  e => {
    throw e
  }
)

const Imports: TImports<SupportedImport> = {
  FLASHLOAN: Flashloan,
  ERROR: async (d, s, n, a, o, p) => {
    log.error('---', ...colors.red(p), 'is not a valid DyDx import')
    return { Addresses: [], ABIs: [], Pack: [] }
  }
}
