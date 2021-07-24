/** @format */

import { IContractImport, SupportedNetwork } from '../daisconfig'
import { resolve as pathResolve } from 'path'
import { colors, log, makeFile } from '../utils'
import { Kyber } from '../files/contracts/__contracts__'
import { Addresses } from '../addresses'
import { Kyber as KyberABIs } from '../files/abis/__abis__'
import { IIndividualWriterReturn, IWriterReturn, TImports } from './__imports__'

export type SupportedImport = 'IKYBERNETWORKPROXY'

export const KyberWriter = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  ci: IContractImport
): Promise<IWriterReturn> =>
  Imports[
    (() => {
      const pack = ci.pack.toUpperCase() as SupportedImport
      if (!Imports[pack]) return 'ERROR'
      return pack
    })()
  ](dir, solver, net, ci.abi, ci.pack).then(data => ({
    ...data,
    Pack:
      !ci.omitNpmPack && data.PackOrNot
        ? (() => {
            log.warning(
              'Kyber does not have an npm package relating to',
              ci.pack
            )
            return ['']
          })()
        : ['']
  }))

const IKyberNetworkProxy = async (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean
): Promise<IIndividualWriterReturn> =>
  makeFile(
    pathResolve(dir + '/contracts/interfaces/Kyber/IKyberNetworkProxy.sol'),
    Kyber.Interfaces.IKyberNetworkProxy(solver)
  ).then(() => ({
    Addresses:
      net === 'all'
        ? [
            {
              NET: 'KOVAN',
              ContractName: 'IKyberNetworkProxy',
              Address: Addresses.KYBER.IKyberNetworkProxy.KOVAN
            },
            {
              NET: 'ROPSTEN',
              ContractName: 'IKyberNetworkProxy',
              Address: Addresses.KYBER.IKyberNetworkProxy.ROPSTEN
            },
            {
              NET: 'MAINNET',
              ContractName: 'IKyberNetworkProxy',
              Address: Addresses.KYBER.IKyberNetworkProxy.MAINNET
            }
          ]
        : [
            {
              NET: net,
              ContractName: 'IKyberNetworkProxy',
              Address: Addresses.KYBER.IKyberNetworkProxy[net]
            }
          ],

    ABIs: abi
      ? [
          {
            ContractName: 'IKyberNetworkProxy',
            ABI: KyberABIs.IKyberNetworkProxyABI
          }
        ]
      : [],

    PackOrNot: true
  }))

const Imports: TImports<SupportedImport> = {
  IKYBERNETWORKPROXY: IKyberNetworkProxy,
  ERROR: async (d, s, n, a, p) => {
    log.error('---', ...colors.red(p), 'is not a valid Kyber import')
    return {
      Addresses: [],
      ABIs: [],
      PackOrNot: false
    }
  }
}
