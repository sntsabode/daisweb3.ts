import { IContractImport } from '../daisconfig'

export type TImports<K> = {
  readonly [protocol in keyof K]: (
    dir: string,
    solver: string,
    ci: IContractImport
  ) => Promise<void[]>
}
