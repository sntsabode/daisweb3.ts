/** @format */

interface IContractExportInterfaces<IT> {
  readonly Interfaces: IT
}

interface IContractExportLibraries<LT> {
  readonly Libraries: LT
}

/* Aave */
import * as AaveInterfaces from './aave/interfaces'
import * as AaveLibraries from './aave/libraries'
export const Aave: IContractExportInterfaces<typeof AaveInterfaces> &
  IContractExportLibraries<typeof AaveLibraries> = {
  Interfaces: AaveInterfaces,
  Libraries: AaveLibraries
}

/* Bancor */
import * as BancorInterfaces from './bancor/interfaces'
export const Bancor: IContractExportInterfaces<typeof BancorInterfaces> = {
  Interfaces: BancorInterfaces
}

/* DyDx */
import * as DyDxInterfaces from './dydx/interfaces'
import * as DyDxLibraries from './dydx/libraries'
export const DyDx: IContractExportInterfaces<typeof DyDxInterfaces> &
  IContractExportLibraries<typeof DyDxLibraries> = {
  Interfaces: DyDxInterfaces,
  Libraries: DyDxLibraries
}

/* Kyber */
import * as KyberInterfaces from './kyber/interfaces'
export const Kyber: IContractExportInterfaces<typeof KyberInterfaces> = {
  Interfaces: KyberInterfaces
}

/* OneInch */
import * as OneInchInterfaces from './oneinch/interfaces'
export const OneInch: IContractExportInterfaces<typeof OneInchInterfaces> = {
  Interfaces: OneInchInterfaces
}

/* OpenZeppelin */
import * as OpenZeppelinInterfaces from './openzeppelin/interfaces'
export const OpenZeppelin: IContractExportInterfaces<
  typeof OpenZeppelinInterfaces
> = {
  Interfaces: OpenZeppelinInterfaces
}

/* Truffle */
import * as TruffleLibraries from './truffle/libraries'
export const Truffle: IContractExportLibraries<typeof TruffleLibraries> = {
  Libraries: TruffleLibraries
}

/* Uniswap */
import * as UniswapInterfaces from './uniswap/interfaces'
export const Uniswap: IContractExportInterfaces<typeof UniswapInterfaces> = {
  Interfaces: UniswapInterfaces
}
