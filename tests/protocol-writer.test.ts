import mock from 'mock-fs'
import chai, { assert, expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { makeBaseDirs, ProtocolFileWriter } from '../lib/protocol-writer'
import fs from 'fs'
import { resolve } from 'path'
import { transpile } from 'typescript'
import { SupportedNetwork, SupportedProtocol } from '../lib/daisconfig'

chai.use(chaiAsPromised).should()

const solver = '0.8.6'
const net = 'all'

describe(
'ProtocolFileWriter Test Suite',
() => {
  beforeEach(() => mock({
    'test-dir': { }
  }))

  it(
  'Should call the makeBaseDirs function',
  async () => {
    const dirPromise = (path: string) => new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (err) return reject(err)
        resolve(files)
      })
    })

    const dirAllPromise = () => Promise.all([
      dirPromise(resolve('test-dir/contracts/interfaces')),
      dirPromise(resolve('test-dir/contracts/libraries')),
      dirPromise(resolve('test-dir/lib/__abis__/abis')),
      dirPromise(resolve('test-dir/migrations'))
    ])

    // Should throw an error since the directories shouldn't exist
    await dirAllPromise()
      .then(() => { throw 'Files Exist' }, e => { })

    await makeBaseDirs('test-dir')

    // Promise should resolve
    await dirAllPromise()
      .catch(e => { throw e })
  })

  // ProtcolFileWriter is not a very testable class
  // TODO: Refactor it
  it(
  'Should call the ProtocolFileWriter.main method',
  async () => {
    // Should call the function with every protocol import triggering
    // branches that weren't covered in the ProtocolWriter functions 
    // test suite. No point in testing if the files write. That was tested
    // in the ProtocolsWriter test suite.
    const deps = await ProtocolFileWriter.instance.main('test-dir', [{
      protocol: 'BANCOR',
      pack: 'IBANCORNETWORK',
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'DYDX',
      pack: 'FLASHLOAN',
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'KYBER',
      pack: 'IKYBERNETWORKPROXY',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'ONEINCH',
      pack: 'ONESPLIT',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'ONEINCH',
      pack: 'ONESPLITMULTI',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'UNISWAP',
      pack: 'V2ROUTER02',
      abi: true,
      omitNpmPack: false
    }], solver, net)

    assert.isNotEmpty(deps)
    for (const dep of deps)
      assert.isNotEmpty(dep)

    const ABIs_ = fs.readFileSync(resolve('test-dir/lib/__abis__/abis.ts')).toString()
    // Testing is tricky because of the require statements made in abis.ts
    // TODO: better assertions
    assert(ABIs_)

    const Addresses_ = fs.readFileSync(resolve('test-dir/lib/addresses.ts')).toString()
    // evil eval :0
    const Addresses = eval(transpile(Addresses_))

    expect(Addresses).to.have.property('BANCOR')
    expect(Addresses).to.have.property('DYDX')
    expect(Addresses).to.have.property('KYBER')
    expect(Addresses).to.have.property('ONEINCH')
    expect(Addresses).to.have.property('UNISWAP')

    expect(Addresses.BANCOR).to.have.property('MAINNET')
    expect(Addresses.BANCOR).to.have.property('ROPSTEN')
    expect(Addresses.BANCOR).to.have.property('KOVAN')

    for (const [ContractName, Address] of Object.entries(
      Addresses.BANCOR.MAINNET)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.BANCOR.ROPSTEN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.BANCOR.KOVAN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    expect(Addresses.DYDX).to.have.property('MAINNET')
    expect(Addresses.DYDX).to.have.property('ROPSTEN')
    expect(Addresses.DYDX).to.have.property('KOVAN')

    for (const [ContractName, Address] of Object.entries(
      Addresses.DYDX.MAINNET)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.DYDX.ROPSTEN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.DYDX.KOVAN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    expect(Addresses.KYBER).to.have.property('MAINNET')
    expect(Addresses.KYBER).to.have.property('ROPSTEN')
    expect(Addresses.KYBER).to.have.property('KOVAN')

    for (const [ContractName, Address] of Object.entries(
      Addresses.KYBER.MAINNET)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.KYBER.ROPSTEN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.KYBER.KOVAN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    expect(Addresses.ONEINCH).to.have.property('MAINNET')
    expect(Addresses.ONEINCH).to.have.property('ROPSTEN')
    expect(Addresses.ONEINCH).to.have.property('KOVAN')

    for (const [ContractName, Address] of Object.entries(
      Addresses.ONEINCH.MAINNET)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.ONEINCH.ROPSTEN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.ONEINCH.KOVAN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    expect(Addresses.UNISWAP).to.have.property('MAINNET')
    expect(Addresses.UNISWAP).to.have.property('ROPSTEN')
    expect(Addresses.UNISWAP).to.have.property('KOVAN')

    for (const [ContractName, Address] of Object.entries(
      Addresses.UNISWAP.MAINNET)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.UNISWAP.ROPSTEN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }

    for (const [ContractName, Address] of Object.entries(
      Addresses.UNISWAP.KOVAN)
    ) {
      assert.isString(ContractName)
      assert.isString(Address)
    }
  })

  it(
  'Should call the ProtocolFileWriter.main method with an all erroneous contractImports param',
  async () => {
    const ProtocolFileWriter02 = ProtocolFileWriter.instance.newInstance()
    const deps = await ProtocolFileWriter02.main('test-dir', [{
      protocol: 'iefbwoi' as SupportedProtocol,
      pack: 'webfuwe',
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'oibnion' as SupportedProtocol,
      pack: 'ioboi', 
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'fwefw' as SupportedProtocol,
      pack: 'wwefw',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'asde' as SupportedProtocol,
      pack: 'adww',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'wefwe' as SupportedProtocol,
      pack: 'AHfwq',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'webdwue' as SupportedProtocol,
      pack: 'ssefde',
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'BANCOR',
      pack: 'oinioni',
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'DYDX',
      pack: 'inioni',
      abi: true,
      omitNpmPack: false
    }, {
      protocol: 'KYBER',
      pack: 'oinioni',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'ONEINCH',
      pack: 'oioiwnei',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'ONEINCH',
      pack: 'ponion',
      abi: true,
      omitNpmPack: true
    }, {
      protocol: 'UNISWAP',
      pack: 'wdeow',
      abi: true,
      omitNpmPack: false
    }], 'weufbwuef', 'wuefbuwef' as SupportedNetwork)
  
    assert.isEmpty(deps)

    const Addresses_ = fs.readFileSync(resolve('test-dir/lib/addresses.ts')).toString()
    const ABIs_ = fs.readFileSync(resolve('test-dir/lib/__abis__/abis.ts')).toString()

    assert.equal(Addresses_, 'export const Addresses = {\n}')
    assert.equal(ABIs_, '/* eslint-disable */')
  })
  
  afterEach(() => mock.restore())
})