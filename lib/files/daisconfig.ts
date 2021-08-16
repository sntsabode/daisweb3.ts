/** @format */

export const DaisConfig = `
{
  "solversion": "0.8.6",
  "defaultNet": "MAINNET",
  "eslint": true,
  "git": true,
  "contractWriteDir": "/lib/__abis__/artifacts",
  "ganache": true,
  "mocha": true,
  "packman": "yarn",
  "omitTruffleHdWalletProvider": false,
  "ethNodeURL": "wss://mainnet.infura.io/ws/v3/",
  "contractImports": [
    {
      "protocol": "AAVE",
      "pack": "ILendingPool",
      "omitNpmPack": true,
      "abi": true
    },
    {
      "protocol": "UNISWAP",
      "pack": "V2Router02",
      "omitNpmPack": true,
      "abi": true
    },
    {
      "protocol": "DYDX",
      "pack": "Flashloan",
      "omitNpmPack": true,
      "abi": false
    },
    {
      "protocol": "KYBER",
      "pack": "IKyberNetworkProxy",
      "omitNpmPack": true,
      "abi": true
    },
    {
      "protocol": "ONEINCH",
      "pack": "OneSplit",
      "omitNpmPack": true,
      "abi": true
    },
    {
      "protocol": "ONEINCH",
      "pack": "OneSplitMulti",
      "omitNpmPack": true,
      "abi": true
    },
    {
      "protocol": "BANCOR",
      "pack": "IBancorNetwork",
      "omitNpmPack": true,
      "abi": true
    }
  ],

  "addedDependencies": [
    "express"
  ],

  "addedDevDependencies": [
    "@types/express"
  ]
}
`.trim()
