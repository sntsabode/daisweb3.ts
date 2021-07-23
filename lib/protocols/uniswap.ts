import { IContractImport, SupportedNetwork } from '../daisconfig'
import { colors, log, makeFile } from '../utils'
import { IABIReturn, IAddressReturn, IIndividualWriterReturn, IWriterReturn, TImports } from './__imports__'
import { resolve as pathResolve } from 'path'
import { Uniswap } from '../files/contracts/__contracts__'
import { Addresses } from '../addresses'
import { Uniswap as UniswapABIs } from '../files/abis/__abis__'
import { NPMPacks } from '../npm-packs'

export type SupportedImport =
| 'V2ROUTER02'

export const UniswapWriter = async (
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
    Pack: !ci.omitNpmPack ? NPMPacks.UNISWAP.V2SDK : ['']
  })
)

const IUniswapV2Router01AllAddresses: IAddressReturn[] = [{
  NET: 'KOVAN',
  ContractName: 'IUniswapV2Router01',
  Address: Addresses.UNISWAP.IUniswapV2Router01.KOVAN
}, {
  NET: 'ROPSTEN',
  ContractName: 'IUniswapV2Router01',
  Address: Addresses.UNISWAP.IUniswapV2Router01.ROPSTEN
}, {
  NET: 'MAINNET',
  ContractName: 'IUniswapV2Router01',
  Address: Addresses.UNISWAP.IUniswapV2Router01.MAINNET
}]

const IUniswapV2Router01ABI: IABIReturn = {
  ABI: UniswapABIs.IUniswapV2Router01,
  ContractName: 'IUniswapV2Router01'
}

const V2Router = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean
): Promise<IIndividualWriterReturn> => Promise.all([
  makeFile(pathResolve(
    dir + '/contracts/interfaces/Uniswap/IUniswapV2Router01.sol'
  ), Uniswap.Interfaces.IUniswapV2Router01(solver)),

  makeFile(pathResolve(
    dir + '/contracts/interfaces/Uniswap/IUniswapV2Router02.sol'
  ), Uniswap.Interfaces.IUniswapV2Router02(solver))
]).then(
  () => ({
    Addresses: net === 'all' ? [
      ...IUniswapV2Router01AllAddresses, {
        NET: 'KOVAN',
        ContractName: 'IUniswapV2Router02',
        Address: Addresses.UNISWAP.IUniswapV2Router02.KOVAN
      }, {
        NET: 'ROPSTEN',
        ContractName: 'IUniswapV2Router02',
        Address: Addresses.UNISWAP.IUniswapV2Router02.ROPSTEN
      }, {
        NET: 'MAINNET',
        ContractName: 'IUniswapV2Router02',
        Address: Addresses.UNISWAP.IUniswapV2Router02.MAINNET
      }
    ] : [{
      NET: net,
      ContractName: 'IUniswapV2Router01',
      Address: Addresses.UNISWAP.IUniswapV2Router01[net]
    }, {
      NET: net,
      ContractName: 'IUniswapV2Router02',
      Address: Addresses.UNISWAP.IUniswapV2Router02[net]
    }],

    ABIs: abi ? [IUniswapV2Router01ABI, {
      ContractName: 'IUniswapV2Router02',
      ABI: UniswapABIs.IUniswapV2Router02
    }] : []
  }),

  e => { throw e }
)

const Imports: TImports<SupportedImport> = {
  V2ROUTER02: V2Router,
  ERROR: async (d,s,n,a, p) => {
    log.error(...colors.red(p), 'is not a valid Uniswap import')
    return { Addresses: [], ABIs: [] }
  }
}