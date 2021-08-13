/** @format */
/*
yarn run mocha -r ts-node/register tests/protocols/uniswap.test.ts --timeout 900000
*/
import mock from 'mock-fs'
import { UniswapWriter } from '../../lib/protocols/uniswap'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { readFileSync } from 'fs'
import { Uniswap } from '../../lib/files/contracts/__contracts__'
import { Uniswap as UniswapABIs } from '../../lib/files/abis/__abis__'
import { Addresses } from '../../lib/addresses'

chai.use(chaiAsPromised).should()

const dir = 'test-dir'
const solver = '0.8.6'

describe('UniswapWriter Test Suite', () => {
  beforeEach(() =>
    mock({
      'test-dir/contracts/interfaces/Uniswap/': {}
    })
  )

  it('Should call the UniswapWriter function with the "V2ROUTER02" option', async () => {
    const res = await UniswapWriter(dir, solver, 'all', {
      protocol: 'UNISWAP',
      pack: 'V2ROUTER02',
      omitNpmPack: false,
      abi: true
    })

    expect(res).to.have.property('ABIs')
    expect(res).to.have.property('Addresses')
    expect(res).to.have.property('Pack')

    assert.isNotEmpty(res.ABIs)
    assert.isNotEmpty(res.Addresses)
    assert.isNotEmpty(res.Pack)

    assert.strictEqual(
      res.ABIs.some(
        abi =>
          abi.ContractName === 'IUniswapV2Router01' &&
          abi.ABI === UniswapABIs.IUniswapV2Router01
      ),
      true,
      'ABIs IUniswapV2Router01'
    )

    assert.strictEqual(
      res.ABIs.some(
        abi =>
          abi.ContractName === 'IUniswapV2Router02' &&
          abi.ABI === UniswapABIs.IUniswapV2Router02
      ),
      true,
      'ABIs IUniswapV2Router02'
    )

    for (const abi of res.ABIs) {
      assert.isString(abi.ABI)
      assert.isString(abi.ContractName)
    }

    // TODO: assert all networks

    assert.strictEqual(
      res.Addresses.some(
        address =>
          address.Address === Addresses.UNISWAP.IUniswapV2Router01.MAINNET &&
          address.ContractName === 'IUniswapV2Router01' &&
          address.NET === 'MAINNET'
      ),
      true,
      'Addresses IUniswapV2Router01'
    )

    assert.strictEqual(
      res.Addresses.some(
        address =>
          address.Address === Addresses.UNISWAP.IUniswapV2Router02.MAINNET &&
          address.ContractName === 'IUniswapV2Router02' &&
          address.NET === 'MAINNET'
      ),
      true,
      'Addresses IUniswapV2Router02'
    )

    for (const address of res.Addresses) {
      assert.isString(address.Address)
      assert.isString(address.ContractName)
      assert.isString(address.NET)
    }

    for (const pack of res.Pack) assert.isString(pack)

    const IUniswapV2Router01 = readFileSync(
      'test-dir/contracts/interfaces/Uniswap/IUniswapV2Router01.sol'
    ).toString()
    assert.strictEqual(
      IUniswapV2Router01,
      Uniswap.Interfaces.IUniswapV2Router01(solver)
    )

    const IUniswapV2Router02 = readFileSync(
      'test-dir/contracts/interfaces/Uniswap/IUniswapV2Router02.sol'
    ).toString()
    assert.strictEqual(
      IUniswapV2Router02,
      Uniswap.Interfaces.IUniswapV2Router02(solver)
    )
  })

  it('Should call the UniswapWriter function with an erroneous input, whilst omitting the npmPack', async () => {
    const res = await UniswapWriter(dir, solver, 'MAINNET', {
      protocol: 'UNISWAP',
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
        readFileSync(
          'test-dir/contracts/interfaces/Uniswap/IUniswapV2Router01.sol'
        ).toString()
        readFileSync(
          'test-dir/contracts/interfaces/Bancor/IUniswapV2Router02.sol'
        ).toString()
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
