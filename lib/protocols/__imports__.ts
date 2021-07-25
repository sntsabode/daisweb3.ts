/** @format */

import { SupportedNetwork, SupportedProtocol } from '../daisconfig'
import { colors, log } from '../utils'

export interface IWriterReturn {
  Addresses: IAddressReturn[]
  ABIs: IABIReturn[]
  Pack: string[]
}

export type IIndividualWriterFunc = (
  dir: string,
  solver: string,
  net: SupportedNetwork | 'all',
  abi: boolean,
  omitNpmPack: boolean,
  pack: string
) => Promise<IWriterReturn>

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

export function npmPackError(
  omitNpmPack: boolean,
  pack: string,
  protocol: SupportedProtocol
): string[] {
  if (omitNpmPack)
    return []

  log.error(
    `${protocol} doesn't have an npm package relating to`,
    ...colors.red(pack)
  )
  return []
}