import { 
  mkdir,
  writeFile,
  readdirSync,
  rmSync,
  lstatSync
} from 'fs'
import { createInterface } from 'readline'
import Box from 'cli-box'
import trash from 'trash'
import path from 'path'

export const dir = process.cwd()

export const purgeDir = (dir: string): void => {
  for (const entry of readdirSync(dir)) {
    rmSync(entry, { 
      recursive: true,
      force: true,
      retryDelay: 1000,
      maxRetries: 3
    })
  }
}

export const trashDir = async (
  dir: string
): Promise<void[]> => {
  return Promise.all(readdirSync(dir).map(async path_ => {
    const curPath = path.join(dir, path_)

    if (path_ === 'node_modules') return purgeDir(curPath)

    if (lstatSync(curPath).isDirectory()) {
      await trashDir(curPath)
        .catch(e => { throw e })
    } else
      trash(curPath)
  }))
}

export async function ask(
  lcb: () => void
): Promise<'Y' | 'N'> {
  const read = createInterface(process.stdin)
  return new Promise((resolve, reject) => {
    lcb()
    log.warning('Enter (Y) or (N)')
    read.question('Are you sure (Y/N)', a => {
      read.close()

      if (a === 'Y' || a === 'y' || a === 'yes')
        resolve('Y')
      if (a === 'N' || a === 'n' || a === 'no')
        resolve('N')

      reject(`
        Could not determine answer.

        Please enter ${((): string => {
          const [Y, y, yes] = colors.green('Y', 'y', 'yes')
          const [N, n, no, errA] = colors.red('N', 'n', 'no', a)
          return `${Y} / ${y} / ${yes} or ${N} / ${n} / ${no}
        
        You entered ${errA}
        `
      })()}`)
    })
  })
}

export const makeFile = async (
  path: string,
  data: string
): Promise<void> => new Promise((resolve, reject) =>
  writeFile(path, data, 
    err => err ? reject(err) : resolve()  
  )
)

export const makeDir = async (
  path: string
): Promise<void> => new Promise((resolve, reject) =>
  mkdir(path, { recursive: true }, 
    err => err ? reject(err) : resolve()
  )
)

export const colors = {
  red: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[31m${msg}${colors.reset}`
  ),

  green: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[32m${msg}${colors.reset}`
  ),

  yellow: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[33m${msg}${colors.reset}`
  ),

  blue: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[34m${msg}${colors.reset}`
  ),

  magenta: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[35m${msg}${colors.reset}`
  ),

  cyan: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[36m${msg}${colors.reset}`
  ),

  white: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[37m${msg}${colors.reset}`
  ),

  blink: <T>(...msg: T[]): string[] => msg.map(
    msg => `\x1b[5m${msg}${colors.reset}`
  ),

  reset: '\x1b[0m'
}

const tag = '[daisweb3.ts]'
export function log<L>(...msg: L[]): void {
  return console.log(
    ...colors.cyan(tag),
    ...msg
  )
}

// eslint-disable-next-line
export namespace log {
  export const error = <E>(
    ...msg: E[]
  ): void => console.error(
    ...colors.red(tag),
    ...msg
  )

  export const success = <S>(
    ...msg: S[]
  ): void => console.log(
    ...colors.green(tag),
    ...msg
  )

  export const warning = <W>(
    ...msg: W[]
  ): void => console.error(
    ...colors.yellow(tag),
    ...msg
  )

  export const cyanbox = colors.cyan(
    '╭',
    '─',
    '╮',
    '│',
    '╯',
    '─',
    '╰',
    '│'
  )

  export function withbox(
    templateLiteral: string
  ): void {
    return console.log(
      new Box({
      w: 50,
      h: 10,
      stringify: false,
      marks: {
        nw: cyanbox[0],
        n: cyanbox[1],
        ne: cyanbox[2],
        e: cyanbox[3],
        se: cyanbox[4],
        s: cyanbox[5],
        sw: cyanbox[6],
        w: cyanbox[7]
      }
    }, templateLiteral).stringify())
  }

  // eslint-disable-next-line
  export namespace withbox {
    const errorbox = colors.red(
      '╭',
      '─',
      '╮',
      '│',
      '╯',
      '─',
      '╰',
      '│'
    )

    const successbox = colors.green(
      '╭',
      '─',
      '╮',
      '│',
      '╯',
      '─',
      '╰',
      '│'
    )

    export const error = (
      templateLiteral: string,
      w = 50,
      h = 10
    ): void => console.error(new Box({
      w: w,
      h: h,
      stringify: false,
      marks: {
        nw: errorbox[0],
        n: errorbox[1],
        ne: errorbox[2],
        e: errorbox[3],
        se: errorbox[4],
        s: errorbox[5],
        sw: errorbox[6],
        w: errorbox[7]
      }
    }, templateLiteral).stringify())

    export const success = (
      templateLiteral: string,
      w = 50,
      h = 10
    ): void => console.log(new Box({
      w: w,
      h: h,
      stringify: false,
      marks: {
        nw: successbox[0],
        n: successbox[1],
        ne: successbox[2],
        e: successbox[3],
        se: successbox[4],
        s: successbox[5],
        sw: successbox[6],
        w: successbox[7]
      }
    }, templateLiteral).stringify())
  }
}

// eslint-disable-next-line
export type untyped = any