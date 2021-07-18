export interface IContractImport {
  readonly protocol: SupportedProtocol
  readonly pack: string
  readonly omitNpmPack: boolean
  readonly abi: boolean
  readonly tsHelpers: boolean
}

export interface IDaisConfig {
  readonly solversion: string
  readonly defaultNet: string
  readonly eslint: boolean
  readonly git: boolean
  readonly contractWriteDir: string
  readonly ganache: boolean
  readonly packman: 'yarn' | 'npm'
  readonly omitTruffleHdWalletProvider: boolean
  readonly contractImports: IContractImport[]
  readonly addedDependencies: string[]
  readonly addedDevDependencies: string[]
}

export type SupportedProtocol =
  | 'DYDX'
  | 'UNISWAP'
  | 'KYBER'
  | 'ONEINCH'
  | 'BANCOR'