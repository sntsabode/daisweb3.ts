import mock from 'mock-fs'
import { AaveWriter } from '../../lib/protocols/aave'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { Aave } from '../../lib/files/contracts/__contracts__'
import { Addresses } from '../../lib/addresses'
import { NPMPacks } from '../../lib/npm-packs'

chai.use(chaiAsPromised).should()

const dir = 'test-dir'
const solver = '0.8.6'

describe(
'AaveWriter Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir/contracts/interfaces/Aave/': { },
    'test-dir/contracts/libraries/Aave/': { }
  }))

  it(
  'Should call the AaveWriter function with the "ILENDINGPOOLADDRESSESPROVIDER" option',
  async () => {
    const res = await AaveWriter(dir, solver, 'MAINNET', {
      protocol: 'AAVE',
      pack: 'ILENDINGPOOLADDRESSESPROVIDER',
      omitNpmPack: false,
      abi: false
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Pack')
    expect(res).to.have.property('Addresses')

    assert.isEmpty(res.ABIs)
    assert.isNotEmpty(res.Pack)
    assert.strictEqual(res.Addresses.length, 1)

    assert.strictEqual(res.Addresses[0].NET, 'MAINNET')
    assert.strictEqual(res.Addresses[0].ContractName, 'ILendingPoolAddressesProvider')
    assert.strictEqual(res.Addresses[0].Address, Addresses.AAVE.LendingPoolAddressesProvider.MAINNET)

    assert.strictEqual(res.Pack, NPMPacks.AAVE.V2SDK)

    const ILendingPoolAddressesProvider = readFileSync('test-dir/contracts/interfaces/Aave/ILendingPoolAddressesProvider.sol').toString()
    assert.strictEqual(ILendingPoolAddressesProvider, Aave.Interfaces.ILendingPoolAddressesProvider(solver))
  })

  it(
  'Should call the AaveWriter function with the "ILENDINGPOOL" option',
  async () => {
    const res = await AaveWriter(dir, solver, 'all', {
      protocol: 'AAVE',
      pack: 'ILENDINGPOOL',
      omitNpmPack: false,
      abi: false
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.strictEqual(res.Pack, NPMPacks.AAVE.V2SDK)

    assert.strictEqual(res.Addresses.some(
      adrs => adrs.NET === 'KOVAN' 
        && adrs.ContractName === 'LendingPool'
        && adrs.Address === Addresses.AAVE.LendingPool.KOVAN
    ), true)

    assert.strictEqual(res.Addresses.some(
      adrs => adrs.NET === 'ROPSTEN' 
        && adrs.ContractName === 'LendingPool'
        && adrs.Address === Addresses.AAVE.LendingPool.ROPSTEN
    ), true)

    assert.strictEqual(res.Addresses.some(
      adrs => adrs.NET === 'MAINNET' 
        && adrs.ContractName === 'LendingPool'
        && adrs.Address === Addresses.AAVE.LendingPool.MAINNET
    ), true)

    assert.strictEqual(res.Addresses.some(
      adrs => adrs.NET === 'KOVAN' 
        && adrs.ContractName === 'LendingPoolAddressesProvider'
        && adrs.Address === Addresses.AAVE.LendingPoolAddressesProvider.KOVAN
    ), true)

    assert.strictEqual(res.Addresses.some(
      adrs => adrs.NET === 'ROPSTEN' 
        && adrs.ContractName === 'LendingPoolAddressesProvider'
        && adrs.Address === Addresses.AAVE.LendingPoolAddressesProvider.ROPSTEN
    ), true)

    assert.strictEqual(res.Addresses.some(
      adrs => adrs.NET === 'MAINNET' 
        && adrs.ContractName === 'LendingPoolAddressesProvider'
        && adrs.Address === Addresses.AAVE.LendingPoolAddressesProvider.MAINNET
    ), true)

    const ILendingPoolAddressesProvider = readFileSync('test-dir/contracts/interfaces/Aave/ILendingPoolAddressesProvider.sol').toString()
    assert.strictEqual(ILendingPoolAddressesProvider, Aave.Interfaces.ILendingPoolAddressesProvider(solver))

    const ILendingPool = readFileSync('test-dir/contracts/interfaces/Aave/ILendingPool.sol').toString()
    assert.strictEqual(ILendingPool, Aave.Interfaces.ILendingPool(solver))
    
    const DataTypes = readFileSync('test-dir/contracts/libraries/Aave/DataTypes.sol').toString()
    assert.strictEqual(DataTypes, Aave.Libraries.DataTypes(solver))
  })

  it(
  'Should call the AaveWriter function with an erroneous input',
  async () => {
    const res = await AaveWriter(dir, solver, 'KOVAN', {
      protocol: 'AAVE',
      pack: '______',
      omitNpmPack: true,
      abi: true
    })

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
})