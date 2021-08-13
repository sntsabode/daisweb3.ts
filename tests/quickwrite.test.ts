/*
yarn run mocha -r ts-node/register tests/quickwrite.test.ts --timeout 900000
*/
import mock from 'mock-fs'
import { assert } from 'chai'
import { randomBytes } from 'crypto'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs'
import { resolve, join } from 'path'
import { Uniswap } from '../lib/files/contracts/__contracts__'
import { Uniswap as UniswapABIs } from '../lib/files/abis/__abis__'
import { QuickWrite } from '../lib/quickwrite'
import { npminit } from '../lib/lib'

let childWorkingDir = resolve(process.cwd() + '/quickwrite_testdir')
const local = (() => {
  try {
    readFileSync(resolve(process.cwd() + '/.local'))
    return true
  } catch (e) {
    return false
  }
})()

local ? console.log('Tests running locally') : console.log('Remote testing')

describe('QuickWrite Test Suite', () => {
  beforeEach(() => {
    mock.restore()

    if (local) {
      try {
        mkdirSync(childWorkingDir)
      } catch (e) {}
      return
    }

    childWorkingDir += randomBytes(22).toString('hex')
  })

  it('Should call the QuickWrite function with 1 parameter (calling the protocolOnly function)', async () => {
    await QuickWrite(['AAVE'], childWorkingDir)
  })

  it('Should call the QuickWrite function with 3 parameters (calling the protocolPackAndAbi function)', async () => {
    await QuickWrite(['AAVE', 'ILENDINGPOOL', 'abi'], childWorkingDir)
  })

  it('Should call the QuickWrite function with 4 parameters (calling the protocolPackAbiAndOmitNpmPack function)', async () => {
    await QuickWrite(['UNISWAP', 'V2ROUTER02', 'false', 'false'], childWorkingDir)
  })

  it('Should call the QuickWrite function with 5 parameters (calling the networkParamMissing function)', async () => {
    await QuickWrite(['DYDX', 'FLASHLOAN', 'false', 'omitNpmPack', '0.8.6'], childWorkingDir)
  })

  it('Should call the QuickWrite function with all parameters (calling the quickWrite function)', async () => {
    mkdirSync(join(childWorkingDir + '/contracts/interfaces/Uniswap'), { recursive: true })
    await QuickWrite(['UNISWAP', 'V2ROUTER02', 'abi', 'false', '0.8.6', 'all'], childWorkingDir, childWorkingDir)
  
    const [
      IUniswapV2Router01, IUniswapV2Router02,
      IUniswapV2Router01ABI, IUniswapV2Router02ABI,
      node_modules, packjson
    ] = [
      readFileSync(resolve(childWorkingDir + '/contracts/interfaces/Uniswap/IUniswapV2Router01.sol')).toString(),
      readFileSync(resolve(childWorkingDir + '/contracts/interfaces/Uniswap/IUniswapV2Router02.sol')).toString(),
      readFileSync(resolve(childWorkingDir + '/lib/__abis__/abis/IUniswapV2Router01.json')).toString(),
      readFileSync(resolve(childWorkingDir + '/lib/__abis__/abis/IUniswapV2Router02.json')).toString(),
      existsSync(resolve(childWorkingDir + '/node_modules')),
      existsSync(resolve(childWorkingDir + '/package.json'))
    ]

    assert.strictEqual(IUniswapV2Router01, Uniswap.Interfaces.IUniswapV2Router01('0.8.6'))
    assert.strictEqual(IUniswapV2Router02, Uniswap.Interfaces.IUniswapV2Router02('0.8.6'))
    assert.strictEqual(IUniswapV2Router01ABI, UniswapABIs.IUniswapV2Router01)
    assert.strictEqual(IUniswapV2Router02ABI, UniswapABIs.IUniswapV2Router02)
    
    assert.isTrue(node_modules, 'node_modules')
    assert.isTrue(packjson, 'package.json')
  })

  it('Should call the QuickWrite function with all parameters with an existing package.json in the directory', async () => {
    await npminit(true, childWorkingDir)
    mkdirSync(join(childWorkingDir + '/contracts/interfaces/Bancor'), { recursive: true })
    await QuickWrite(['BANCOR', 'IBANCORNETWORK', 'abi', 'false', '0.8.6', 'all'], childWorkingDir, childWorkingDir)
  })

  afterEach(() => {
    if (local) {
      rmSync(childWorkingDir, { recursive: true })
      return
    }
  })
})