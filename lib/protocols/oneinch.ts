/** @format */

import { IContractImport, SupportedNetwork } from '../daisconfig'
import { colors, log, makeFile } from '../utils'
import {
  IAddressReturn,
  IWriterReturn,
  npmPackError,
  TImports
} from './__imports__'
import { resolve as pathResolve } from 'path'
import { OneInch } from '../files/contracts/__contracts__'
import { Addresses } from '../addresses'
import { OneInch as OneInchABIs } from '../files/abis/__abis__'

type SupportedImport = 'ONESPLIT' | 'ONESPLITMULTI'

// prettier-ignore
export const OneInchWriter = async (
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

const AllOneSplitAuditAddresses: IAddressReturn[] = [
  {
    NET: 'KOVAN',
    ContractName: 'OneSplitAudit',
    Address: Addresses.ONEINCH.OneSplitAudit.KOVAN
  },
  {
    NET: 'ROPSTEN',
    ContractName: 'OneSplitAudit',
    Address: Addresses.ONEINCH.OneSplitAudit.ROPSTEN
  },
  {
    NET: 'MAINNET',
    ContractName: 'OneSplitAudit',
    Address: Addresses.ONEINCH.OneSplitAudit.MAINNET
  }
]

// prettier-ignore
const IOneSplit = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  omitNpmPack: boolean,
  pack: string
): Promise<IWriterReturn> => makeFile(
  pathResolve(dir + '/contracts/interfaces/OneInch/IOneSplit.sol'),
  OneInch.Interfaces.IOneSplit(solver)
).then(
  () => ({
    Addresses:
      net === 'all'
        ? AllOneSplitAuditAddresses
        : [
            {
              NET: net,
              ContractName: 'OneSplitAudit',
              Address: Addresses.ONEINCH.OneSplitAudit[net]
            }
          ],

    ABIs: abi
      ? [
          {
            ContractName: 'IOneSplitMulti',
            ABI: OneInchABIs.IOneSplitMulti
          }
        ]
      : [],

    Pack: (() => {
      if (omitNpmPack)
        return []

      log.error(
        "OneInch doesn't have an npm package relating to",
        ...colors.red(pack)
      )
      return []
    })()
  }),
  e => {
    throw e
  }
)

// prettier-ignore
const IOneSplitMulti = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  omitNpmPack: boolean,
  pack: string
): Promise<IWriterReturn> => Promise.all([
  makeFile(
    pathResolve(dir + '/contracts/interfaces/OneInch/IOneSplit.sol'),
    OneInch.Interfaces.IOneSplit(solver)
  ),

  makeFile(
    pathResolve(dir + '/contracts/interfaces/OneInch/IOneSplitMulti.sol'),
    OneInch.Interfaces.IOneSplitMulti(solver)
  )
]).then(() => ({
  Addresses:
    net === 'all'
      ? AllOneSplitAuditAddresses
      : [
          {
            NET: net,
            ContractName: 'OneSplitAudit',
            Address: Addresses.ONEINCH.OneSplitAudit[net]
          }
        ],

  ABIs: abi
    ? [
        {
          ContractName: 'IOneSplitMulti',
          ABI: OneInchABIs.IOneSplitMulti
        }
      ]
    : [],

  Pack: npmPackError(omitNpmPack, pack, 'ONEINCH')
}),
e => {
  throw e
})

const Imports: TImports<SupportedImport> = {
  ONESPLIT: IOneSplit,
  ONESPLITMULTI: IOneSplitMulti,
  ERROR: async (d,s,n,a,o, p) => {
    log.error('---', ...colors.red(p), 'is not a valid OneInch import')
    return { Addresses: [], ABIs: [], Pack: [] }
  }
}