import fs from 'fs'

export const purgeDir = async (
  path: string
): Promise<void[]> => new Promise((resolve, reject) =>
  fs.readdir(path, (err, entries) => err ? reject(
    err
  ) : resolve(
    (() => entries.map(
      entry => fs.rm(entry,
        err => err ? reject(err) : { }
      )
    ))()
  )
))

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