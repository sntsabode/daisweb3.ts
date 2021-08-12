import { SupportedNetwork, SupportedProtocol } from './daisconfig'
import { ProtocolFileWriter } from './protocol-writer'
import { colors, log } from './utils'

export type SupportedArgsLength =
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'

export async function QuickWrite(args: string[], dir: string): Promise<void> {
  checkArgsLength(args)

  const argsLength = args.length.toString() as SupportedArgsLength

  return which[argsLength](args, dir)
}

const which: {
  [argslength in SupportedArgsLength]: (args: string[], dir: string) => Promise<void> | void
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

async function quickWrite(args: string[], dir: string) {
  const protocol = assertProtocol(args[0])
  const pack = assertPack(protocol, args[1])
  const [abi, omitNpmPack, solver] = [args[2], args[3], args[4]]
  const network = assertNetwork(args[5])

  const res = await ProtocolFileWriter.instance.protocols[protocol](
    dir, solver, network, {
      protocol,
      pack,
      abi: abi ? true : false,
      omitNpmPack: omitNpmPack ? true : false
    }
  )

  console.log(res)
}

/**
 * Called if all but the one parameter is missing from the 
 * params passed in to the daisweb3 command.
 * @param args 
 */
function networkParamMissing(args: string[]) {
  const protocol = assertProtocol(args[0])
  const [
    pack, abi, omitNpmPack, solver,
    MAINNET, ROPSTEN, KOVAN, all
  ] = colors.green(
    assertPack(protocol, args[1]),
    args[2], args[3], args[4], 'MAINNET',
    'ROPSTEN', 'KOVAN', 'all'
  )
  const [daisweb3] = colors.cyan('daisweb3')

  log.withbox(`
    ${colors.red('Network parameter missing')[0]}.

    List of Supported Networks:
    | ${MAINNET}
    | ${ROPSTEN}
    | ${KOVAN}
    | ${all}
  `, 100)

  log.withbox(`
  Run:

  ${daisweb3} ${colors.green(protocol)[0]} ${pack} ${abi} ${omitNpmPack} ${solver} <SupportedNetwork | all>

  `, 100)
}

function protocolPackAbiAndOmitNpmPack(args: string[]) {
  const protocol = assertProtocol(args[0])
  const [pack, abi, omitNpmPack] = colors.green(assertPack(protocol, args[1]), args[2], args[3])
  const [daisweb3] = colors.cyan('daisweb3')
  

  log.withbox(`
  You have 2 parameters missing...

  Run:

  ${daisweb3} ${colors.green(protocol)[0]} ${pack} ${abi} ${omitNpmPack} <0.8.6> <SupportedNetwork | all>

  `, 100)
}

function protocolPackAndAbi(args: string[]) {
  const protocol = assertProtocol(args[0])
  const [pack, abi] = colors.green(assertPack(protocol, args[1]), args[2])
  const [daisweb3] = colors.cyan('daisweb3')
  

  log.withbox(`
  You have 3 parameters missing...

  Run:

  ${daisweb3} ${colors.green(protocol)[0]} ${pack} ${abi} <omitNpmPack | false> <0.8.6> <SupportedNetwork | all>

  `, 100)
}

/**
 * Called if only one or two arguments are passed into the 
 * daisweb3 command
 * @param args 
 * @returns 
 */
function protocolOnly(args: string[]) {
  const protocol = assertProtocol(args[0])
  return protocolOnly_(protocol)
}
function protocolOnly_(protocol: SupportedProtocol) {
  const [prot] = colors.green(protocol)
  log.withbox(`
    You have entered the ${prot} protocol.

    Supported imports are
    ${supportedProtocols[protocol].map((protocol_) => `\n${colors.green(protocol_)[0]}`)}
  `)

  log.success(`
    Run ${colors.cyan('daisweb3')[0]} <${protocol}> <${supportedProtocols[protocol].map(
      (prot_, i) => i === 0 ? prot_ : ` | ${prot_}`
    )}> <abi | false> <omitNpmPack | false> <0.8.6> <SupportedNetwork | all>
  `)
}

function assertNetwork(net: string) {
  return (!['MAINNET', 'ROPSTEN', 'KOVAN', 'all'].includes(net))
    ? (() => { throw new Error('You have entered an unsupported network') })()
    : net as SupportedNetwork | 'all'
}

function assertPack(prot: SupportedProtocol, pack: string) {
  return !supportedProtocols[prot].includes(pack)
    ? (() => { throw new Error(`You have entered an unsupported ${colors.green(
      prot
    )[0]} import`) })()
    : pack
}

function assertProtocol(prot: string) {
  return !supportedProtocols[prot.toUpperCase() as SupportedProtocol]
    ? (() => { throw new Error('You have entered an unsupported protocol') })()
    : prot.toUpperCase() as SupportedProtocol
}

function checkArgsLength(args: string[]) {
  if (args.length > 6) {
    const [daisweb3] = colors.cyan('daisweb3')

    log.withbox.error(`
      Your input is erroneous.

      The command uses the following format:

      ${daisweb3} <protocol> <pack> <abi> <omitNpmPack> <solver> <network>
    `, 100)

    throw new Error('Too many arguments')
  }
}