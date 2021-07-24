/** @format */

export const InitialMigrationJS = `
// eslint-disable-next-line
const Migrations = artifacts.require('Migrations')

// eslint-disable-next-line
module.exports = deployer => {
  deployer.deploy(Migrations)
}
`.trim()

export const TruffleConfig = (
  solver: string,
  contractWriteDir: string
): string => `
// eslint-disable-next-line
require('dotenv').config()
// eslint-disable-next-line
const HDWalletProvider = require('@truffle/hdwallet-provider')

// eslint-disable-next-line
module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run 'develop' or 'test'. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network (network-name)
   */
    
  networks: {
    development: {
      host: 'localhost',     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: '*',       // Any network (default: none)
      websockets: true,
      networkCheckTimeout: 6000
    },
    kovan: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY_KOVAN, process.env.ETH_NODE_URL_KOVAN), // eslint-disable-line
      network_id: 42,      // Kovan's id
      gas: 5500000,        // Kovan has a lower block limit than mainnet
      confirmations: 2,    // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
  
    mainnet: {  // eslint-disable-next-line
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.ETH_NODE_URL),
      network_id: 1,
      networkCheckTimeout: 20000,
    },
    
    // Useful for private networks
    // private: {
    //    provider: () => new HDWalletProvider(mnemonic, 'https://network.io'),
    //    network_id: 2111,   // This network is yours, in the cloud.
    //    production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },
    
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },
    
  // Configure your compilers
  compilers: {
    solc: {
      version: '${solver}',    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion         
      // optimizer: {
      //   enabled: false,
      //   runs: 200
      // },
      //  evmVersion: 'byzantium'
      // }
    },
  },
      
  contracts_directory: './contracts/',
  contracts_build_directory: '${contractWriteDir}',
}
`
