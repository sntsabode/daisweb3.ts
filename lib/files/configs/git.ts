export const gitignore = `
node_modules
.env
infura.txt
artifacts
`.trim()

export const gitattributes = `
contracts/interfaces/@OpenZeppelin/IERC20.sol* linguist-vendored

contracts/interfaces/Uniswap/IUniswapV2Router01.sol* linguist-vendored
contracts/interfaces/Uniswap/IUniswapV2Router02.sol* linguist-vendored

contracts/interfaces/Kyber/IKyberNetworkProxy.sol* linguist-vendored

contracts/interfaces/Bancor/IContractRegistry.sol* linguist-vendored
contracts/interfaces/Bancor/IBancorNetwork.sol* linguist-vendored

contracts/interfaces/OneInch/IOneSplit.sol* linguist-vendored

contracts/libraries/DyDx/Types.sol* linguist-vendored
contracts/libraries/DyDx/Actions.sol* linguist-vendored
contracts/libraries/DyDx/Account.sol* linguist-vendored

contracts/interfaces/DyDx/ISoloMargin.sol* linguist-vendored
contracts/interfaces/DyDx/ICallee.sol* linguist-vendored
`.trim()