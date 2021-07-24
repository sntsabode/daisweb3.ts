/** @format */

export interface IContractImport {
  readonly protocol: SupportedProtocol
  readonly pack: string
  readonly omitNpmPack: boolean
  readonly abi: boolean
}

export interface IDaisConfig {
  readonly solversion: string
  readonly defaultNet: SupportedNetwork | 'all'
  readonly eslint: boolean
  readonly git: boolean
  readonly contractWriteDir: string
  readonly ganache: boolean
  readonly packman: 'yarn' | 'npm'
  readonly omitTruffleHdWalletProvider: boolean
  readonly ethNodeURL: string
  readonly contractImports: IContractImport[]
  readonly addedDependencies: string[]
  readonly addedDevDependencies: string[]
}

export type SupportedNetwork = 'MAINNET' | 'KOVAN' | 'ROPSTEN'

export type SupportedProtocol =
  | 'BANCOR'
  | 'DYDX'
  | 'KYBER'
  | 'ONEINCH'
  | 'UNISWAP'

export const SupportedProtocolsArray: SupportedProtocol[] = [
  'BANCOR',
  'DYDX',
  'KYBER',
  'ONEINCH',
  'UNISWAP'
]
