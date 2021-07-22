describe(
'daisweb3 Test Suite',
() => {
  describe(
  'ProtocolWriter functions Test Suite',
  () => {
    require('./protocols/bancor.test')
    require('./protocols/dydx.test')
    require('./protocols/kyber.test')
    require('./protocols/oneinch.test')
    //require('./protocols/uniswap.test')
  })

  describe(
  'Utils Test Suite',
  () => {
    //require('./utils.test')
  })

  describe(
  'Main lib Test Suite',
  () => {
    //require('./lib.test')
  })
})