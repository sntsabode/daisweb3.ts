import mock from 'mock-fs'
import { DyDxWriter } from '../../lib/protocols/dydx'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { DyDx } from '../../lib/files/contracts/__contracts__'

chai.use(chaiAsPromised).should()

const dir = 'test-dir'
const solver = '0.8.6'

describe(
'DyDxWriter Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir/contracts': { },
    'test-dir/contracts/interfaces/DyDx/': { },
    'test-dir/contracts/libraries/DyDx/': { }
  }))

  it(
  'Should call the DyDxWriter function with the "FLASHLOAN" option',
  async () => {
    const res = await DyDxWriter(dir, solver, 'all', {
      protocol: 'DYDX',
      pack: 'FLASHLOAN',
      omitNpmPack: false,
      abi: true,
      tsHelpers: true
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.isNotEmpty(res.Addresses)
    assert.isNotEmpty(res.Pack)

    for (const address of res.Addresses) {
      assert.isString(address.Address)
      assert.isString(address.ContractName)
      assert.isString(address.NET)
    }

    for (const pack of res.Pack)
      assert.isString(pack)

    
    const Flashloan = readFileSync('test-dir/contracts/Flashloan.sol').toString()
    assert.strictEqual(Flashloan, DyDx.Libraries.FlashloanBoilerplate(solver))
    
    const ICallee = readFileSync('test-dir/contracts/interfaces/DyDx/ICallee.sol').toString()
    assert.strictEqual(ICallee, DyDx.Interfaces.ICallee(solver))
    
    const ISoloMargin = readFileSync('test-dir/contracts/interfaces/DyDx/ISoloMargin.sol').toString()
    assert.strictEqual(ISoloMargin, DyDx.Interfaces.ISoloMargin(solver))
    
    const Account = readFileSync('test-dir/contracts/libraries/DyDx/Account.sol').toString()
    assert.strictEqual(Account, DyDx.Libraries.Account(solver))
    
    const Actions = readFileSync('test-dir/contracts/libraries/DyDx/Actions.sol').toString()
    assert.strictEqual(Actions, DyDx.Libraries.Actions(solver))
    
    const Types = readFileSync('test-dir/contracts/libraries/DyDx/Types.sol').toString()
    assert.strictEqual(Types, DyDx.Libraries.Types(solver))
  })

  it(
  'Should call the DyDxWriter function with an erroneous input, whilst omitting the npmPack',
  async () => {
    const res = await DyDxWriter(dir, solver, 'MAINNET', {
      protocol: 'DYDX',
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
        readFileSync('test-dir/contracts/Flashloan.sol').toString()
        readFileSync('test-dir/contracts/interfaces/DyDx/ICallee.sol').toString()
        readFileSync('test-dir/contracts/interfaces/DyDx/ISoloMargin.sol').toString()
        readFileSync('test-dir/contracts/libraries/DyDx/Account.sol').toString()
        readFileSync('test-dir/contracts/libraries/DyDx/Actions.sol').toString()
        readFileSync('test-dir/contracts/libraries/DyDx/Types.sol').toString()
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