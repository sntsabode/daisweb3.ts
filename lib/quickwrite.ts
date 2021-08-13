/** @format */

import { SupportedNetwork, SupportedProtocol } from './daisconfig'
import { ProtocolFileWriter } from './protocol-writer'
import { IABIReturn, IAddressReturn } from './protocols/__imports__'
import { colors, log, makeDir, makeFile } from './utils'
import { resolve as pathResolve } from 'path'
import { npminit, runInstallCommands } from './lib'
import { readFile } from 'fs'

export type SupportedArgsLength = '1' | '2' | '3' | '4' | '5' | '6'

export async function QuickWrite(
  args: string[],
  dir: string,
  childWorkingDir?: string
): Promise<void> {
  checkArgsLength(args)

  const argsLength = args.length.toString() as SupportedArgsLength

  return which[argsLength](args, dir, childWorkingDir)
}

const which: {
  [argslength in SupportedArgsLength]: (
    args: string[],
    dir: string,
    childWorkingDir?: string
  ) => Promise<void> | void
} = {
  '1': protocolOnly,
  '2': protocolOnly,
  '3': protocolPackAndAbi,
  '4': protocolPackAbiAndOmitNpmPack,
  '5': networkParamMissing,
  '6': quickWrite
}

const supportedProtocols: {
  readonly [prot in SupportedProtocol]: string[]
} = {
  AAVE: ['ILENDINGPOOL', 'ILENDINGPOOLADDRESSESPROVIDER'],
  BANCOR: ['IBANCORNETWORK'],
  DYDX: ['FLASHLOAN'],
  KYBER: ['IKYBERNETWORKPROXY'],
  ONEINCH: ['ONESPLIT', 'ONESPLITMULTI'],
  UNISWAP: ['V2ROUTER02']
}

async function quickWrite(
  args: string[],
  dir: string,
  childWorkingDir?: string
) {
  const protocol = assertProtocol(args[0])
  const pack = assertPack(protocol, args[1])
  const [abi, omitNpmPack, solver] = [
    boolParams(args[2], 'false'),
    boolParams(args[3], 'false'),
    args[4]
  ]
  const network = assertNetwork(args[5])

  const res = await ProtocolFileWriter.instance.protocols[protocol](
    dir,
    solver,
    network,
    {
      protocol,
      pack,
      abi,
      omitNpmPack
    }
  )

  await writeABIFiles(res.ABIs, dir).catch(e => {
    throw e
  })

  const packjsonExists = await findFile(dir, 'package.json').catch(e => {
    throw e
  })

  if (!packjsonExists && res.Pack.length > 0)
    await npminit(true, childWorkingDir).catch(e => {
      throw e
    })

  if (res.Pack.length > 0)
    await runInstall(res.Pack, dir, childWorkingDir).catch(e => {
      throw e
    })

  logABIImports(res.ABIs, protocol)
  logAddresses(res.Addresses, protocol)
}

async function runInstall(
  deps: string[],
  dir: string,
  childWorkingDir?: string
) {
  return runInstallCommands('yarn', false, deps, false, childWorkingDir).then(
    async yarn => {
      // eslint-disable-next-line
      if (yarn!.code !== 0) {
        const yarnlockExists = await findFile(dir, 'yarn.lock')
        if (!yarnlockExists)
          return runInstallCommands(
            'npm',
            false,
            deps,
            false,
            childWorkingDir
          ).catch(e => {
            throw e
          })

        log.warning(
          'Found',
          colors.cyan('yarn.lock')[0],
          'file. Aborting npm i'
        )
      }

      return yarn
    }
  )
}

async function findFile(dir: string, file: string) {
  return new Promise<boolean>(resolve => {
    readFile(pathResolve(dir, file), err => {
      if (err) resolve(false)
      resolve(true)
    })
  })
}

async function writeABIFiles(abis: IABIReturn[], dir: string) {
  const Promises = () =>
    Promise.all(
      abis.map(abi =>
        makeFile(
          pathResolve(`${dir}/lib/__abis__/abis/${abi.ContractName}.json`),
          abi.ABI
        )
      )
    )

  return Promises().catch(e => {
    if (!e.errno) throw e
    if (e.errno !== -2) throw e

    return makeDir(pathResolve(`${dir}/lib/__abis__/abis/`)).then(
      () => Promises(),
      e => {
        throw e
      }
    )
  })
}

function logABIImports(abis: IABIReturn[], protocol: SupportedProtocol) {
  if (abis.length === 0) return

  const [export_, const_, eq, require_] = colors.magenta(
    'export',
    'const',
    '=',
    'require'
  )
  let ABIfile = `${export_} ${const_} ${protocol}_ABIs ${eq} {`

  for (const abi of abis) {
    const [pathToABI_] = colors.blue(`'./abis/${abi.ContractName}.json'`)
    ABIfile += `\n  ${abi.ContractName}: ${require_}(${pathToABI_})`
  }

  ABIfile += `\n}`

  console.log()
  console.log(ABIfile)
}

function logAddresses(
  addresses: IAddressReturn[],
  protocol: SupportedProtocol
) {
  const [export_, const_, eq] = colors.magenta('export', 'const', '=')
  let AddressesFile = `${export_} ${const_} Addresses ${eq} {`
  AddressesFile += `\n  ${protocol}: {`

  for (const address of addresses) {
    const [address_] = colors.blue(`'${address.Address}'`)
    AddressesFile += `\n    ${address.ContractName}_${address.NET}: ${address_}`
  }

  AddressesFile += `\n  }`
  AddressesFile += `\n}`

  console.log()
  console.log(AddressesFile)
}

/**
 * Called if all but the one parameter is missing from the
 * params passed in to the daisweb3 command.
 * @param args
 */
function networkParamMissing(args: string[]) {
  const protocol = assertProtocol(args[0])
  const [pack, abi, omitNpmPack, solver, MAINNET, ROPSTEN, KOVAN, all] =
    colors.green(
      assertPack(protocol, args[1]),
      args[2],
      args[3],
      args[4],
      'MAINNET',
      'ROPSTEN',
      'KOVAN',
      'all'
    )
  const [daisweb3] = colors.cyan('daisweb3')

  log.withbox(
    `
    ${colors.red('Network parameter missing')[0]}.

    List of Supported Networks:
    | ${MAINNET}
    | ${ROPSTEN}
    | ${KOVAN}
    | ${all}
  `,
    100
  )

  log.withbox(
    `
  Run:

  ${daisweb3} ${
      colors.green(protocol)[0]
    } ${pack} ${abi} ${omitNpmPack} ${solver} <SupportedNetwork | all>

  `,
    100
  )
}

function protocolPackAbiAndOmitNpmPack(args: string[]) {
  const protocol = assertProtocol(args[0])
  const [pack, abi, omitNpmPack] = colors.green(
    assertPack(protocol, args[1]),
    args[2],
    args[3]
  )
  const [daisweb3] = colors.cyan('daisweb3')

  log.withbox(
    `
  You have 2 parameters missing...

  Run:

  ${daisweb3} ${
      colors.green(protocol)[0]
    } ${pack} ${abi} ${omitNpmPack} <0.8.6> <SupportedNetwork | all>

  `,
    100
  )
}

function protocolPackAndAbi(args: string[]) {
  const protocol = assertProtocol(args[0])
  const [pack, abi] = colors.green(assertPack(protocol, args[1]), args[2])
  const [daisweb3] = colors.cyan('daisweb3')

  log.withbox(
    `
  You have 3 parameters missing...

  Run:

  ${daisweb3} ${
      colors.green(protocol)[0]
    } ${pack} ${abi} <omitNpmPack | false> <0.8.6> <SupportedNetwork | all>

  `,
    100
  )
}

function logSupportedImports(protocol: SupportedProtocol) {
  const [prot] = colors.green(protocol)
  log.withbox(`
    You have entered the ${prot} protocol.

    Supported imports are
    ${supportedProtocols[protocol].map(
      protocol_ => `\n${colors.green(protocol_)[0]}`
    )}
  `)
}

/**
 * Called if only one or two arguments are passed into the
 * daisweb3 command
 * @param args
 * @returns
 */
function protocolOnly(args: string[]) {
  const protocol = assertProtocol(args[0])
  logSupportedImports(protocol)
}

function boolParams(omitNpmPack: string, param: string) {
  if (omitNpmPack === param) return false
  return true
}

function assertNetwork(net: string) {
  return !['MAINNET', 'ROPSTEN', 'KOVAN', 'all'].includes(net)
    ? (() => {
        throw new Error('You have entered an unsupported network')
      })()
    : (net as SupportedNetwork | 'all')
}

function assertPack(prot: SupportedProtocol, pack: string) {
  return !supportedProtocols[prot].includes(pack)
    ? (() => {
        logSupportedImports(prot)
        throw new Error(
          `You have entered an unsupported ${
            colors.green(prot)[0]
          } import. See above for supported imports.`
        )
      })()
    : pack
}

function assertProtocol(prot: string) {
  return !supportedProtocols[prot.toUpperCase() as SupportedProtocol]
    ? (() => {
        throw new Error('You have entered an unsupported protocol')
      })()
    : (prot.toUpperCase() as SupportedProtocol)
}

function checkArgsLength(args: string[]) {
  if (args.length > 6) {
    const [daisweb3] = colors.cyan('daisweb3')

    log.withbox.error(
      `
      Your input is erroneous.

      The command uses the following format:

      ${daisweb3} <protocol> <pack> <abi> <omitNpmPack> <solver> <network>
    `,
      100
    )

    throw new Error('Too many arguments')
  }
}
