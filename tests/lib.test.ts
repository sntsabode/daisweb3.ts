import mock from 'mock-fs'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fetchdaisconfig, Init } from '../lib/lib'

chai.use(chaiAsPromised).should()

describe(
'Lib Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir': { }
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

  afterEach(() => mock.restore())
})