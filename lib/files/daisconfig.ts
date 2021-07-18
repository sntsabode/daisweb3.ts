export const DaisConfig = `
{
  "solversion": "0.8.6",
  "defaultNet": "MAINNET",
  "eslint": true,
  "git": true,
  "contractWriteDir": "/lib/__abis__/artifacts",
  "ganache": false,
  "packman": "yarn",
  "omitTruffleHdWalletProvider": false,
  "contractImports": [
    {
      "protocol": "UNISWAP",
      "pack": "V2Router",
      "omitNpmPack": true,
      "abi": false
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
      "pack": "OneInch",
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