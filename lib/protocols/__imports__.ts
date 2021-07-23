import { SupportedNetwork } from '../daisconfig'

export interface IIndividualWriterReturn {
  Addresses: IAddressReturn[]
  ABIs: IABIReturn[]
  PackOrNot: boolean
}

export interface IWriterReturn extends IIndividualWriterReturn {
  Pack: string[]
}

export type IIndividualWriterFunc = (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  pack: string
) => Promise<IIndividualWriterReturn>

/**
 * Interface for the functions that write the required smart
 * contract files.
 * 
 */
export type TImports<K extends string> = {
  readonly [protocol in K]: IIndividualWriterFunc
} & {
  ERROR: IIndividualWriterFunc
}

export interface IABIReturn {
  ContractName: string
  ABI: string
}

export interface IAddressReturn {
  NET: SupportedNetwork
  ContractName: string
  Address: string
}