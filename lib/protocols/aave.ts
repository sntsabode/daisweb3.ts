/** @format */

import { IContractImport, SupportedNetwork } from '../daisconfig'
import { colors, log, makeFile } from '../utils'
import { resolve as pathResolve } from 'path'
import { Aave } from '../files/contracts/__contracts__'
import { IAddressReturn, IWriterReturn, TImports } from './__imports__'
import { Addresses } from '../addresses'
import { NPMPacks } from '../npm-packs'

export type SupportedImport = 'ILENDINGPOOL' | 'ILENDINGPOOLADDRESSESPROVIDER'

// prettier-ignore
/**
 * Assumes the `Aave` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directories
 */
export const AaveWriter = async (
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

// prettier-ignore
const AllLendingPoolAddressesProviderAddresses: IAddressReturn[] = [{
  NET: 'KOVAN',
  ContractName: 'LendingPoolAddressesProvider',
  Address: Addresses.AAVE.LendingPoolAddressesProvider.KOVAN
}, {
  NET: 'ROPSTEN',
  ContractName: 'LendingPoolAddressesProvider',
  Address: Addresses.AAVE.LendingPoolAddressesProvider.ROPSTEN
}, {
  NET: 'MAINNET',
  ContractName: 'LendingPoolAddressesProvider',
  Address: Addresses.AAVE.LendingPoolAddressesProvider.MAINNET
}]

// prettier-ignore
const AllLendingPoolAddresses: IAddressReturn[] = [{
  NET: 'KOVAN',
  ContractName: 'LendingPool',
  Address: Addresses.AAVE.LendingPool.KOVAN
}, {
  NET: 'ROPSTEN',
  ContractName: 'LendingPool',
  Address: Addresses.AAVE.LendingPool.ROPSTEN
}, {
  NET: 'MAINNET',
  ContractName: 'LendingPool',
  Address: Addresses.AAVE.LendingPool.MAINNET
}]

// prettier-ignore
const ILendingPoolAddressesProvider = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  omitNpmPack: boolean
): Promise<IWriterReturn> => makeFile(pathResolve(
  dir + '/contracts/interfaces/Aave/ILendingPoolAddressesProvider.sol'),
  Aave.Interfaces.ILendingPoolAddressesProvider(solver)
).then(
  () => ({
    Addresses: 
      net === 'all'
        ? AllLendingPoolAddressesProviderAddresses
        : [{
          NET: net,
          ContractName: 'ILendingPoolAddressesProvider',
          Address: Addresses.AAVE.LendingPoolAddressesProvider[net]
        }],
    ABIs: abi ? (() => {
      log.error('Aave ABIs are currently missing... Feel free to contribute')
      return []
    })() : [],
    Pack: (() => {
      if (omitNpmPack)
        return []
      
      return NPMPacks.AAVE.V2SDK
    })()
  }),

  e => {
    throw e
  }
)

// prettier-ignore
const ILendingPool = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  omitNpmPack: boolean
) => Promise.all([
  makeFile(pathResolve(
    dir + '/contracts/interfaces/Aave/ILendingPoolAddressesProvider.sol'
  ), Aave.Interfaces.ILendingPoolAddressesProvider(solver)),

  makeFile(pathResolve(
    dir + '/contracts/interfaces/Aave/ILendingPool.sol'
  ), Aave.Interfaces.ILendingPool(solver)),

  makeFile(pathResolve(
    dir + '/contracts/libraries/Aave/DataTypes.sol'
  ), Aave.Libraries.DataTypes(solver))
]).then(
  () => ({
    Addresses:
      net === 'all'
       ? ([...AllLendingPoolAddresses, ...AllLendingPoolAddressesProviderAddresses])
       : [{
        NET: net,
        ContractName: 'LendingPoolAddressesProvider',
        Address: Addresses.AAVE.LendingPoolAddressesProvider[net]
      }, {
        NET: net,
        ContractName: 'LendingPool',
        Address: Addresses.AAVE.LendingPool[net]
      }],
    ABIs: abi ? (() => {
      log.error('Aave ABIs are currently missing... Feel free to contribute')
      return []
    })() : [],
    Pack: (() => {
      if (omitNpmPack)
        return []
      
      return NPMPacks.AAVE.V2SDK
    })()
  }),

  e => {
    throw e
  }
)

const Imports: TImports<SupportedImport> = {
  ILENDINGPOOLADDRESSESPROVIDER: ILendingPoolAddressesProvider,
  ILENDINGPOOL: ILendingPool,
  ERROR: async (d, s, n, a, o, p) => {
    log.error('---', ...colors.red(p), 'is not a valid Aave import')
    return {
      Addresses: [],
      ABIs: [],
      Pack: []
    }
  }
}
