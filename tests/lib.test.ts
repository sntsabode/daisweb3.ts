import mock from 'mock-fs'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import {
  bootAndWaitForChildProcess,
  fetchdaisconfig,
  git,
  Init,
  mutatePackJson,
  tscInit,
  writeEslintFiles,
  writeGanache,
  writeGitFiles,
  writeTruffleFiles
} from '../lib/lib'
import { Eslint, Ganache, TS } from '../lib/files/configs/__configs__'
import { TruffleConfig, InitialMigrationJS } from '../lib/files/configs/truffle'
import { Truffle } from '../lib/files/contracts/__contracts__'

chai.use(chaiAsPromised).should()

const childWorkingDir = resolve(process.cwd() + '/__test-work-dir__')

describe(
'Lib Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir': {
      'package.json': '{}',
      'contracts': { },
      'migrations': { }
    },

    '__test-work-dir__': { }
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
    await bootAndWaitForChildProcess('ls', ['--l'], childWorkingDir)
  })

  it(
  'Should call the git function',
  async () => {
    // TODO: Make assertions

    await git(false, 'test-dir', childWorkingDir)
    await git(true, 'test-dir', childWorkingDir)
  })

  afterEach(() => mock.restore())
})