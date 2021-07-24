/** @format */

import { SupportedProtocol } from './daisconfig'

type Addresses_ = {
  [protocol in SupportedProtocol]: {
    [key: string]: {
      MAINNET: string
      KOVAN: string
      ROPSTEN: string
    }
  }
}

export const Addresses: Addresses_ = {
  /**
   * Bancor contract addresses
   */
  BANCOR: {
    ContractRegistry: {
      MAINNET: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
      KOVAN: '',
      ROPSTEN: '0xFD95E724962fCfC269010A0c6700Aa09D5de3074'
    }
  },

  /**
   * DyDx contract addresses
   */
  DYDX: {
    ISoloMargin: {
      MAINNET: '0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e',
      KOVAN: '',
      ROPSTEN: ''
    }
  },

  /**
   * Kyber contract addresses
   */
  KYBER: {
    IKyberNetworkProxy: {
      MAINNET: '0x9AAb3f75489902f3a48495025729a0AF77d4b11e',
      KOVAN: '0xc153eeAD19e0DBbDb3462Dcc2B703cC6D738A37c',
      ROPSTEN: '0xd719c34261e099Fdb33030ac8909d5788D3039C4'
    }
  },

  /**
   * OneInch Contract addresses
   */
  ONEINCH: {
    OneSplitAudit: {
      MAINNET: '0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E',
      KOVAN: '',
      ROPSTEN: ''
    }
  },

  /**
   * Uniswap contract addresses
   */
  UNISWAP: {
    IUniswapV2Router01: {
      MAINNET: '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
      KOVAN: '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a',
      ROPSTEN: '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a'
    },

    IUniswapV2Router02: {
      MAINNET: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      KOVAN: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      ROPSTEN: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'
    }
  }
}
