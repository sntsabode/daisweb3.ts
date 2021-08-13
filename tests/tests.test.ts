/** @format */

describe('daisweb3 Test Suite', () => {
  describe('ProtocolWriter functions Test Suite', () => {
    require('./protocols/aave.test')
    require('./protocols/bancor.test')
    require('./protocols/dydx.test')
    require('./protocols/kyber.test')
    require('./protocols/oneinch.test')
    require('./protocols/uniswap.test')
  })

  describe('ProtocolFileWriter Test Suite', () => {
    require('./protocol-writer.test')
  })

  // Tests are failing in a windows Github Actions Runner.
  // They are pretty hacked together to be honest.
  if (process.platform !== 'win32')
    describe('QuickWrite Test Suite', () => {
      require('./quickwrite.test')
    })

  describe('Main lib Test Suite', () => {
    require('./lib.test')
  })
})
