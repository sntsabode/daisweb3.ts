import mock from 'mock-fs'
import { OneInchWriter } from '../../lib/protocols/oneinch'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { OneInch } from '../../lib/files/contracts/__contracts__'

chai.use(chaiAsPromised).should()

const dir = 'test-dir'
const solver = '0.8.6'

describe(
'OneInchWriter Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir/contracts/interfaces/OneInch/': { }
  }))

  it(
  'Should call the OneInchWriter function with the "ONESPLIT" option',
  async () => {
    const res = await OneInchWriter(dir, solver, 'all', {
      protocol: 'ONEINCH',
      pack: 'ONESPLIT',
      omitNpmPack: true,
      abi: true
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.isNotEmpty(res.ABIs)
    assert.isNotEmpty(res.Addresses)

    for (const abi of res.ABIs) {
      assert.isString(abi.ABI)
      assert.isString(abi.ContractName)
    }

    for (const address of res.Addresses) {
      assert.isString(address.Address)
      assert.isString(address.ContractName)
      assert.isString(address.NET)
    }

    const IOneSplit = readFileSync('test-dir/contracts/interfaces/OneInch/IOneSplit.sol').toString()
    assert.strictEqual(IOneSplit, OneInch.Interfaces.IOneSplit(solver))
  })

  it(
  'Should call the OneInchWriter function with the "ONESPLITMULTI" option',
  async () => {
    const res = await OneInchWriter(dir, solver, 'all', {
      protocol: 'ONEINCH',
      pack: 'ONESPLITMULTI',
      omitNpmPack: true,
      abi: true
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.isNotEmpty(res.ABIs)
    assert.isNotEmpty(res.Addresses)

    for (const abi of res.ABIs) {
      assert.isString(abi.ABI)
      assert.isString(abi.ContractName)
    }

    for (const address of res.Addresses) {
      assert.isString(address.Address)
      assert.isString(address.ContractName)
      assert.isString(address.NET)
    }

    const IOneSplit = readFileSync('test-dir/contracts/interfaces/OneInch/IOneSplit.sol').toString()
    assert.strictEqual(IOneSplit, OneInch.Interfaces.IOneSplit(solver))
  
    const IOneSplitMulti = readFileSync('test-dir/contracts/interfaces/OneInch/IOneSplitMulti.sol').toString()
    assert.strictEqual(IOneSplitMulti, OneInch.Interfaces.IOneSplitMulti(solver))
  })

  it(
    'Should call the OneInchWriter function with an erroneous input, whilst omitting the npmPack',
    async () => {
      const res = await OneInchWriter(dir, solver, 'KOVAN', {
        protocol: 'ONEINCH',
        pack: 'ibfuiewbgfiuw',
        omitNpmPack: true,
        abi: true
      })
  
      expect(res).to.have.property('Addresses')
      expect(res).to.have.property('ABIs')
      expect(res).to.have.property('Pack')
  
      assert.isEmpty(res.ABIs)
      assert.isEmpty(res.Addresses)
      assert.strictEqual(res.Pack.length, 1)
      assert.strictEqual(res.Pack[0], '')
  
      await new Promise<void>((resolve, reject) => {
        try {
          readFileSync('test-dir/contracts/interfaces/OneInch/IOneSplit.sol').toString()
          readFileSync('test-dir/contracts/interfaces/OneInch/IOneSplitMulti.sol').toString()
          // Reject the promise if the files read... Files shouldn't exist
          reject('Files exist')
        } catch (e) {
          // Resolve on error
          resolve()
        }
      })
    })

  afterEach(() => mock.restore())
})