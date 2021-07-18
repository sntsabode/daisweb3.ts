import { log, makeFile } from '../utils'
import { interfacesPath } from './__paths__'
import { resolve as pathResolve } from 'path'
import { Bancor } from '../files/contracts/__contracts__'
import { IContractImport } from '../daisconfig'

export type SupportedImport =
  'IBANCORNETWORK'

/**
 * Assumes the `Bancor` directory is already created in the
 * `contract/libraries` and `contract/interfaces` directory
 * @param pack package being imported
 * @param solver solidity version
 */
export async function BancorWriter(
  solver: string,
  ci: IContractImport
): Promise<void> {
  switch(ci.pack.toUpperCase() as SupportedImport) {
    case 'IBANCORNETWORK':
      return IBancorNetwork(solver)
        .catch(e => { throw e })

    default:
      return log.error(ci.pack, 'is not a vaild Bancor import')
  }
}

async function IBancorNetwork(
  solver: string
): Promise<void> {
  return <unknown>Promise.all([
    makeFile(pathResolve(interfacesPath + '/Bancor/IBancorNetwork.sol'),
      Bancor.Interfaces.IBancorNetwork(solver)
    ),

    makeFile(pathResolve(interfacesPath + '/Bancor/IContractRegistry.sol'),
      Bancor.Interfaces.IContractRegistry(solver)
    )
  ]).catch(e => { throw e }) as void
}