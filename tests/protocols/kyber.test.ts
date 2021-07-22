import mock from 'mock-fs'
import { KyberWriter } from '../../lib/protocols/kyber'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { Kyber } from '../../lib/files/contracts/__contracts__'

chai.use(chaiAsPromised).should()

const dir = 'test-dir'
const solver = '0.8.6'

describe(
'KyberWriter Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir/contracts/interfaces/Kyber/': { }
  }))

  it(
  'Should call the KyberWriter function with the "IKYBERNETWORKPROXY" option',
  async () => {
    const res = await KyberWriter(dir, solver, 'all', {
      protocol: 'KYBER',
      pack: 'IKYBERNETWORKPROXY',
      omitNpmPack: true,
      abi: true,
      tsHelpers: true
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

    const IKyberNetworkProxy = readFileSync('test-dir/contracts/interfaces/Kyber/IKyberNetworkProxy.sol').toString()
    assert.strictEqual(IKyberNetworkProxy, Kyber.Interfaces.IKyberNetworkProxy(solver))
  })

  it(
  'Should call the KyberWriter function with an erroneous input, whilst omitting the npmPack',
  async () => {
    const res = await KyberWriter(dir, solver, 'KOVAN', {
      protocol: 'KYBER',
      pack: 'ibfuiewbgfiuw',
      omitNpmPack: true,
      abi: true,
      tsHelpers: true
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
        readFileSync('test-dir/contracts/interfaces/Kyber/IKyberNetworkProxy.sol').toString()
        // Reject the promise if the file read... File shouldn't exist
        reject('Files exist')
      } catch (e) {
        // Resolve on error
        resolve()
      }
    })
  })

  afterEach(() => mock.restore())
})