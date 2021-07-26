import mock from 'mock-fs'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { mkdirSync, readdirSync, readFileSync, rmSync } from 'fs'
import { resolve } from 'path'
import {
  Assemble,
  bootAndWaitForChildProcess,
  fetchdaisconfig,
  git,
  Init,
  mutatePackJson,
  npminit,
  runInstallCommands,
  tscInit,
  writeEslintFiles,
  writeGanache,
  writeGitFiles,
  writeTruffleFiles,
  yarninit
} from '../lib/lib'
import { Eslint, Ganache, TS } from '../lib/files/configs/__configs__'
import { TruffleConfig, InitialMigrationJS } from '../lib/files/configs/truffle'
import { DyDx, Truffle } from '../lib/files/contracts/__contracts__'
import { makeDir } from '../lib/utils'
import { Migrations } from '../lib/files/contracts/truffle/libraries'

chai.use(chaiAsPromised).should()

const childWorkingDir = resolve(process.cwd() + '/atestdir')
const file = (path: string) => readFileSync(childWorkingDir + path).toString()
const local = (() => {
  try {
    readFileSync(resolve(process.cwd() + '/.local'))
    return true
  } catch (e) {
    return false
  }
})()

local ? console.log('Tests running locally') : console.log('Remote testing')

describe(
'Lib Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir': {
      'package.json': '{}',
      'contracts': { },
      'migrations': { }
    },

    'atestdir': { }
  }))

  it(
  'Should call the Init function',
  async () => {
    await Init('test-dir')
    const daisconfig = JSON.parse(readFileSync(resolve('test-dir/.daisconfig')).toString())
    expect(daisconfig).to.have.property('solversion')
    assert.isNotEmpty(daisconfig.solversion)
    expect(daisconfig).to.have.property('defaultNet')
    assert.isNotEmpty(daisconfig.defaultNet)
    expect(daisconfig).to.have.property('eslint')
    assert.isBoolean(daisconfig.eslint)
    expect(daisconfig).to.have.property('git')
    assert.isBoolean(daisconfig.git)
    expect(daisconfig).to.have.property('contractWriteDir')
    assert.isNotEmpty(daisconfig.contractWriteDir)
    expect(daisconfig).to.have.property('ganache')
    assert.isBoolean(daisconfig.ganache)
    expect(daisconfig).to.have.property('packman')
    assert.isNotEmpty(daisconfig.packman)
    expect(daisconfig).to.have.property('omitTruffleHdWalletProvider')
    assert.isBoolean(daisconfig.omitTruffleHdWalletProvider)
    expect(daisconfig).to.have.property('ethNodeURL')
    assert.isNotEmpty(daisconfig.ethNodeURL)
    expect(daisconfig).to.have.property('contractImports')
    assert.isNotEmpty(daisconfig.contractImports)
    assert.isArray(daisconfig.contractImports)
    expect(daisconfig).to.have.property('addedDependencies')
    assert.isArray(daisconfig.addedDependencies)
    expect(daisconfig).to.have.property('addedDevDependencies')
    assert.isArray(daisconfig.addedDevDependencies)
    
    for (const contractImport of daisconfig.contractImports) {
      expect(contractImport).to.have.property('protocol')
      assert.isNotEmpty(contractImport.protocol)
      expect(contractImport).to.have.property('pack')
      assert.isNotEmpty(contractImport.pack)
      expect(contractImport).to.have.property('omitNpmPack')
      assert.isBoolean(contractImport.omitNpmPack)
      expect(contractImport).to.have.property('abi')
      assert.isBoolean(contractImport.abi)
    }
  })

  it(
  'Should call the fetchdaisconfig function',
  async () => {
    // Might as well make one the easy way
    await Init('test-dir')

    const daisconfig = await fetchdaisconfig('test-dir')
    assert.isObject(daisconfig)
  })

  it(
  'Should call the writeGitFiles function',
  async () => {
    await writeGitFiles('test-dir')

    const gitignore = readFileSync(resolve('test-dir/.gitignore')).toString()
    assert.isNotEmpty(gitignore)

    const gitattributes = readFileSync(resolve('test-dir/.gitattributes')).toString()
    assert.isNotEmpty(gitattributes)
  })

  it(
  'Should call the writeEslintFiles function',
  async () => {
    await writeEslintFiles('test-dir')

    const eslintignore = readFileSync(resolve('test-dir/.eslintignore')).toString()
    assert.strictEqual(eslintignore, Eslint.eslintignore)

    const eslintrc = readFileSync(resolve('test-dir/.eslintrc')).toString()
    assert.strictEqual(eslintrc, Eslint.eslintrc)
  })

  it(
  'Should call the writeGanache function',
  async () => {
    await writeGanache('test-dir', 'ETH_NODE_URL')

    const forkChainJS = readFileSync(resolve('test-dir/fork-chain.js')).toString()
    assert.strictEqual(forkChainJS, Ganache.ForkChain('ETH_NODE_URL'))
  })

  it(
  'Should call the writeTruffleFiles function',
  async () => {
    const solver = '0.8.6'
    const contractWriteDir = 'contract-write-dir'

    await writeTruffleFiles('test-dir', solver, contractWriteDir)

    const migrations = readFileSync(resolve('test-dir/contracts/Migrations.sol')).toString()
    assert.strictEqual(migrations, Truffle.Libraries.Migrations(solver))

    const initialMigrationJS = readFileSync(resolve('test-dir/migrations/1_initial_migration.js')).toString()
    assert.strictEqual(initialMigrationJS, InitialMigrationJS)

    const truffleConfig = readFileSync(resolve('test-dir/truffle-config.js')).toString()
    assert.strictEqual(truffleConfig, TruffleConfig(solver, contractWriteDir))
  })

  it(
  'Should call the tscInit function',
  async () => {
    await tscInit('test-dir')

    const tscconfig = readFileSync(resolve('test-dir/tsconfig.json')).toString()
    assert.strictEqual(tscconfig, TS.tsconfig)
  })

  it(
  'Should call the mutatePackJson function',
  async () => {
    const packjsonBefore = readFileSync(resolve('test-dir/package.json')).toString()
    assert.strictEqual(packjsonBefore, '{}')

    await mutatePackJson('test-dir')

    const packjsonAfter = JSON.parse(readFileSync(resolve('test-dir/package.json')).toString())

    expect(packjsonAfter).to.have.property('scripts')
    expect(packjsonAfter.scripts).to.have.property('tsc')
    assert.strictEqual(packjsonAfter.scripts.tsc, 'tsc')

    expect(packjsonAfter).to.have.property('main')
    assert.strictEqual(packjsonAfter.main, '/lib/index.ts')
  })

  it(
  'Should call the bootAndWaitForChildProcess function',
  async () => {
    mock.restore()
    mkdirSync(childWorkingDir, { recursive: true })

    const childpReturn = await bootAndWaitForChildProcess('ls', ['--l'], childWorkingDir)

    expect(childpReturn).to.have.property('code')
    expect(childpReturn).to.have.property('signal')
  })

  it(
  'Should call the git function',
  async () => {
    mock.restore()
    mkdirSync(childWorkingDir, { recursive: true })

    // TODO: Make git folder assertions

    await git(false, childWorkingDir, childWorkingDir)
    await git(true, childWorkingDir, childWorkingDir)

    const gitignore = readFileSync(resolve(childWorkingDir + '/.gitignore')).toString()
    assert.isNotEmpty(gitignore)

    const gitattributes = readFileSync(resolve(childWorkingDir + '/.gitattributes')).toString()
    assert.isNotEmpty(gitattributes)
  })

  describe(
  'NPM and Dependencies Test Suite',
  () => {
    before(async () => {
      mock.restore()
      // Clean slate
      if (local) rmSync(childWorkingDir, { recursive: true })      

      mkdirSync(childWorkingDir, { recursive: true })
    })

    it(
    'Should call the npminit function',
    async () => {
      mock.restore()
      mkdirSync(childWorkingDir, { recursive: true })
      
      await npminit(true, childWorkingDir, 'ignore')

      const packjson = JSON.parse(file('/package.json'))
      assert.isNotEmpty(packjson)
    })

    it(
    'Should call the yarninit function',
    async () => {
      mock.restore()
      mkdirSync(childWorkingDir, { recursive: true })

      await yarninit(true, childWorkingDir, 'ignore')

      const packjson = JSON.parse(file('/package.json'))
      assert.isNotEmpty(packjson)
    })

    it(
    'Should call the runInstallCommands function',
    async () => {
      mock.restore()
      mkdirSync(childWorkingDir, { recursive: true })

      await runInstallCommands('npm', false, ['chalk'], false, childWorkingDir, 'ignore')
      const packagelockJSON = readFileSync(resolve(childWorkingDir + '/package-lock.json')).toString()
      assert.isNotEmpty(packagelockJSON)

      const node_modulesEntries = readdirSync(resolve(childWorkingDir + '/node_modules'))
      assert.isNotEmpty(node_modulesEntries)
    })

    it(
    'Should call the Assemble function',
    async () => {
      mock.restore()
      
      const solver = '0.8.6'

      // Delete this and refactor ProtocolFileWriter to be able to
      // be run more than once (this.#madeDirs.DYDX) in ProtcolFileWriter
      // is set to true by the time this test runs causing undefined behaviour
      await Promise.all([
        makeDir(resolve(childWorkingDir + '/contracts/interfaces/DyDx')),
        makeDir(resolve(childWorkingDir + '/contracts/libraries/DyDx')),
      ])

      // TODO : make assertions

      await Assemble({
        solversion: solver,
        defaultNet: 'MAINNET',
        eslint: true,
        git: false,
        contractWriteDir: '/contract-write-dir',
        ganache: false,
        packman: 'yarn',
        omitTruffleHdWalletProvider: true,
        ethNodeURL: 'ETH_NODE_URL',
        contractImports: [{
          protocol: 'DYDX',
          pack: 'FLASHLOAN',
          omitNpmPack: true,
          abi: false
        }],
        addedDependencies: [],
        addedDevDependencies: []
      }, childWorkingDir, true)

      const packjson = JSON.parse(file('/package.json'))
      assert.isNotEmpty(packjson)

      expect(packjson).to.have.property('dependencies')
      assert.isNotEmpty(packjson.dependencies)

      expect(packjson).to.have.property('devDependencies')
      assert.isNotEmpty(packjson.devDependencies)

      expect(packjson).to.have.property('scripts')
      expect(packjson.scripts).to.have.property('tsc')

      assert.strictEqual(packjson.scripts.tsc, 'tsc')

      const eslintrc = file('/.eslintrc')
      assert.strictEqual(eslintrc, Eslint.eslintrc)

      const eslintignore = file('/.eslintignore')
      assert.strictEqual(eslintignore, Eslint.eslintignore)

      const truffleConfig = file('/truffle-config.js')
      assert.strictEqual(truffleConfig, TruffleConfig(solver, '/contract-write-dir'))

      const Migrations_ = file('/contracts/Migrations.sol')
      assert.strictEqual(Migrations_, Migrations(solver))

      const initialMigrationJS = file('/migrations/1_initial_migration.js')
      assert.strictEqual(initialMigrationJS, InitialMigrationJS)

      const tsconfig = file('/tsconfig.json')
      assert.strictEqual(tsconfig, TS.tsconfig)

      const node_modules = readdirSync(childWorkingDir + '/node_modules')
      assert.isNotEmpty(node_modules)

      const yarnlock = file('/yarn.lock')
      assert.isNotEmpty(yarnlock)

      const ICallee = file('/contracts/interfaces/DyDx/ICallee.sol')
      assert.strictEqual(ICallee, DyDx.Interfaces.ICallee(solver))

      const ISoloMargin = file('/contracts/interfaces/DyDx/ISoloMargin.sol')
      assert.strictEqual(ISoloMargin, DyDx.Interfaces.ISoloMargin(solver))

      const Account = file('/contracts/libraries/DyDx/Account.sol')
      assert.strictEqual(Account, DyDx.Libraries.Account(solver))

      const Actions = file('/contracts/libraries/DyDx/Actions.sol')
      assert.strictEqual(Actions, DyDx.Libraries.Actions(solver))

      const Types = file('/contracts/libraries/DyDx/Types.sol')
      assert.strictEqual(Types, DyDx.Libraries.Types(solver))

      const Flashloan = file('/contracts/Flashloan.sol')
      assert.strictEqual(Flashloan, DyDx.Libraries.FlashloanBoilerplate(solver))
    })

    after(async () => {
      function ignoreError(cb: () => void) {
        try {
          cb()
        } catch (e) { }
      }

      ignoreError(() => rmSync(resolve(childWorkingDir + '/node_modules'), { recursive: true }))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/contracts'), { recursive: true }))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/lib'), { recursive: true }))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/migrations'), { recursive: true }))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/.eslintignore')))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/.eslintrc')))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/truffle-config.js')))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/tsconfig.json')))
      

      ignoreError(() => rmSync(resolve(childWorkingDir + '/yarn.lock')))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/package-lock.json')))
      ignoreError(() => rmSync(resolve(childWorkingDir + '/package.json')))
    })
  })

  afterEach(() => mock.restore())

  after(() => {
    if (local) rmSync(childWorkingDir, { recursive: true })
  })
})