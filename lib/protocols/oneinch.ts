import { IContractImport, SupportedNetwork } from '../daisconfig'
import { colors, log, makeFile } from '../utils'
import { IAddressReturn, IIndividualWriterReturn, IWriterReturn, TImports } from './__imports__'
import { resolve as pathResolve } from 'path'
import { OneInch } from '../files/contracts/__contracts__'
import { Addresses } from '../addresses'
import { OneInch as OneInchABIs } from '../files/abis/__abis__'

type SupportedImport =
  | 'ONESPLIT'
  | 'ONESPLITMULTI'

export const OneInchWriter = async (
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
    Pack: ci.pack ? (() => {
      log.error('OneInch doesn\'t have an npm package relating to', ...colors.red(ci.pack))
      return ''
    })() : ''
  })
)

const AllAddresses: IAddressReturn[] = [{
  NET: 'KOVAN',
  ContractName: 'OneSplitAudit',
  Address: Addresses.ONEINCH.OneSplitAudit.KOVAN
}, {
  NET: 'ROPSTEN',
  ContractName: 'OneSplitAudit',
  Address: Addresses.ONEINCH.OneSplitAudit.ROPSTEN
}, {
  NET: 'MAINNET',
  ContractName: 'OneSplitAudit',
  Address: Addresses.ONEINCH.OneSplitAudit.MAINNET
}]

const IOneSplit = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean
): Promise<IIndividualWriterReturn> => makeFile(pathResolve(
  dir + '/contracts/interfaces/OneInch/IOneSplit.sol'
), OneInch.Interfaces.IOneSplit(solver)).then(() => ({
  Addresses: net === 'all' ? AllAddresses : [{
    NET: net,
    ContractName: 'OneSplitAudit',
    Address: Addresses.ONEINCH.OneSplitAudit[net]
  }],

  ABIs: abi ? [{
    ContractName: 'IOneSplitMulti',
    ABI: OneInchABIs.IOneSplitMulti
  }] : []
}), e => { throw e })

const IOneSplitMulti = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean
): Promise<IIndividualWriterReturn> => Promise.all([
  makeFile(pathResolve(
    dir + '/contracts/interfaces/OneInch/IOneSplit.sol'
  ), OneInch.Interfaces.IOneSplit(solver)),

  makeFile(pathResolve(
    dir + '/contracts/interfaces/OneInch/IOneSplitMulti.sol'
  ), OneInch.Interfaces.IOneSplitMulti(solver))
]).then(() => ({
  Addresses: net === 'all' ? AllAddresses : [{
    NET: net,
    ContractName: 'OneSplitAudit',
    Address: Addresses.ONEINCH.OneSplitAudit[net]
  }],

  ABIs: abi ? [{
    ContractName: 'IOneSplitMulti',
    ABI: OneInchABIs.IOneSplitMulti
  }] : []
}))

const Imports: TImports<SupportedImport> = {
  ONESPLIT: IOneSplit,
  ONESPLITMULTI: IOneSplitMulti,
  ERROR: async (d,s,n,a, p) => {
    log.error(...colors.red(p), 'is not a valid OneInch import')
    return { Addresses: [], ABIs: [] }
  }
}