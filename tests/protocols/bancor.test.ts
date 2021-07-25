import mock from 'mock-fs'
import { BancorWriter } from '../../lib/protocols/bancor'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { Bancor } from '../../lib/files/contracts/__contracts__'

chai.use(chaiAsPromised).should()

const dir = 'test-dir'
const solver = '0.8.6'

describe(
'BancorWriter Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir/contracts/interfaces/Bancor/': { }
  }))

  it(
  'Should call the BancorWriter function with the "IBANCORNETWORK" option',
  async () => {
    const res = await BancorWriter(dir, solver, 'all', {
      protocol: 'BANCOR',
      pack: 'IBANCORNETWORK',
      omitNpmPack: false,
      abi: true
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.isNotEmpty(res.ABIs)
    assert.isNotEmpty(res.Addresses)
    assert.isNotEmpty(res.Pack)

    for (const abi of res.ABIs) {
      assert.isString(abi.ABI)
      assert.isString(abi.ContractName)
    }

    for (const address of res.Addresses) {
      assert.isString(address.Address)
      assert.isString(address.ContractName)
      assert.isString(address.NET)
    }

    for (const pack of res.Pack)
      assert.isString(pack)

    const IBancorNetwork = readFileSync('test-dir/contracts/interfaces/Bancor/IBancorNetwork.sol').toString()
    assert.strictEqual(IBancorNetwork, Bancor.Interfaces.IBancorNetwork(solver))
  
    const IContractRegistry = readFileSync('test-dir/contracts/interfaces/Bancor/IContractRegistry.sol').toString()
    assert.strictEqual(IContractRegistry, Bancor.Interfaces.IContractRegistry(solver))
  })

  it(
  'Should call the BancorWriter function with the "IBANCORNETWORK" options, omitting the abi',
  async () => {
    const res = await BancorWriter(dir, solver, 'MAINNET', {
      protocol: 'BANCOR',
      pack: 'IBANCORNETWORK',
      omitNpmPack: false,
      abi: false
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.isEmpty(res.ABIs)
    assert.strictEqual(res.Addresses.length, 1)

    const IBancorNetwork = readFileSync('test-dir/contracts/interfaces/Bancor/IBancorNetwork.sol').toString()
    assert.strictEqual(IBancorNetwork, Bancor.Interfaces.IBancorNetwork(solver))
  
    const IContractRegistry = readFileSync('test-dir/contracts/interfaces/Bancor/IContractRegistry.sol').toString()
    assert.strictEqual(IContractRegistry, Bancor.Interfaces.IContractRegistry(solver))
  })

  it(
  'Should call the BancorWriter function with an erroneous input, whilst omitting the npmPack',
  async () => {
    const res = await BancorWriter(dir, solver, 'KOVAN', {
      protocol: 'BANCOR',
      pack: 'ibfuiewbgfiuw',
      omitNpmPack: true,
      abi: true
    })

    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Pack')

    assert.isEmpty(res.ABIs)
    assert.isEmpty(res.Addresses)
    assert.strictEqual(res.Pack.length, 0)

    await new Promise<void>((resolve, reject) => {
      try {
        readFileSync('test-dir/contracts/interfaces/Bancor/IBancorNetwork.sol').toString()
        readFileSync('test-dir/contracts/interfaces/Bancor/IContractRegistry.sol').toString()
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