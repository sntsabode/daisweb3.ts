import fs from 'fs'
import { createInterface } from 'readline'

export const dir = process.cwd()

export const purgeDir = (dir: string): void => {
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(entry, { 
      recursive: true,
      force: true,
      retryDelay: 1000,
      maxRetries: 3
    })
  }
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
  fs.writeFile(path, data, 
    err => err ? reject(err) : resolve()  
  )
)

export const makeDir = async (
  path: string
): Promise<void> => new Promise((resolve, reject) =>
  fs.mkdir(path, { recursive: true }, 
    err => err ? reject(err) : resolve()
  )
)

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
}

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

  reset: '\x1b[0m'
}

// eslint-disable-next-line
export type untyped = any