import { SupportedNetwork } from '../daisconfig'

export interface IIndividualWriterReturn {
  Addresses: IAddressReturn[]
  ABIs: IABIReturn[]
}

export interface IWriterReturn extends IIndividualWriterReturn {
  Pack: string
}

/**
 * Interface for the functions that write the required smart
 * contract files.
 * 
 */
export type TImports<K> = {
  readonly [protocol in keyof K]: (
    dir: string,
    solver: string,
    net: SupportedNetwork | 'all',
    abi: boolean,
    pack: string
  ) => Promise<IIndividualWriterReturn>
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