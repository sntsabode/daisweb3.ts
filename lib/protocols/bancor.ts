import { colors, log, makeFile } from '../utils'
import { resolve as pathResolve } from 'path'
import { Bancor } from '../files/contracts/__contracts__'
import { IContractImport, SupportedNetwork } from '../daisconfig'
import { NPMPacks } from '../npm-packs'
import { IIndividualWriterReturn, IWriterReturn, TImports } from './__imports__'
import { Addresses } from '../addresses'
import { Bancor as BancorABIs } from '../files/abis/__abis__'

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
  net: SupportedNetwork | 'all',
  ci: IContractImport
): Promise<IWriterReturn> => Imports[(() => {
  const pack = ci.pack.toUpperCase() as SupportedImport
  if (!Imports[pack])
    return 'ERROR'
  return pack
})()](
  dir, solver, net, ci.abi, ci.pack
).then(
  data => ({
    ...data,
    Pack: !ci.omitNpmPack && data.PackOrNot ?
      NPMPacks.BANCOR.SDK : ['']
  }),
  e => { throw e }
)

const IBancorNetwork = async(
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean
): Promise<IIndividualWriterReturn> => Promise.all([
  makeFile(pathResolve(
    dir + '/contracts/interfaces/Bancor/IBancorNetwork.sol'
  ), Bancor.Interfaces.IBancorNetwork(solver)),

  makeFile(pathResolve(
    dir + '/contracts/interfaces/Bancor/IContractRegistry.sol'
  ), Bancor.Interfaces.IContractRegistry(solver))
]).then(
  () => ({
    Addresses: net === 'all' ? [{
      NET: 'KOVAN',
      ContractName: 'ContractRegistry',
      Address: Addresses.BANCOR.ContractRegistry.KOVAN
    }, {
      NET: 'ROPSTEN',
      ContractName: 'ContractRegistry',
      Address: Addresses.BANCOR.ContractRegistry.ROPSTEN
    }, {
      NET: 'MAINNET',
      ContractName: 'ContactRegistry',
      Address: Addresses.BANCOR.ContractRegistry.MAINNET
    }] : [{
      NET: net,
      ContractName: 'ContractRegistry',
      Address: Addresses.BANCOR.ContractRegistry[net]
    }],

    ABIs: abi ? [{
      ContractName: 'BancorNetwork',
      ABI: BancorABIs.BancorNetworkABI
    }, {
      ContractName: 'ContractRegistry',
      ABI: BancorABIs.ContractRegistryABI
    }] : [],

    PackOrNot: true
  }),
  e => { throw e }
)

const Imports: TImports<SupportedImport>  = {
  IBANCORNETWORK: IBancorNetwork,
  ERROR: async (d,s,n,p, a) => {
    log.error('---', ...colors.red(a), 'is not a valid Bancor import')
    return {
      Addresses: [], ABIs: [], PackOrNot: false
    }
  }
}