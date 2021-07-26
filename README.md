<h1 align="center">Welcome to daisweb3.ts 🚧🏗️</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-brightgreen.svg" />
  </a>
  <img alt="Maintenance" src="https://img.shields.io/badge/Maintained-yes-green.svg" />
  <a href="#" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen" />
  </a>
  <a href="https://github.com/prettier/prettier" target="_blank">
    <img alt="prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"/>
  </a>
</p>

<h2 align="center"> Dais-Web3 </h1>

 Dais-Web3, is part of a suite of Node.js/TypeScript development tools. It is a command line tool that writes the necessary boilerplate to interface with DeFi's more popular platforms using truffle as the Ethereum development environment and Solidity as the Smart Contract language.

## Prerequisites

***Use other verions at own risk***

* truffle >=5.3.10
* node >=16.3.0
* npm >=7.15.1
* yarn >=1.22.10 (not required)

## Installation
***assuming node.js is installed on your machine***

### Install from NPM

```Bash
npm i daisweb3.ts -g
```

Recommend not using yarn global.

### Install from source

```Bash
git clone https://github.com/sntsabode/dais-web3.ts
```

```Bash
cd dais-web3.ts
```

***assuming tsc command is available on your machine***
```Bash
tsc
```

```Bash
npm i -g
```

## Run tests

```sh
yarn run test
```

### Running single test suite

```sh
yarn run mocha -r ts-node/register ./<file> --timeout (recommend above 20s if you plan on running the yarn/npm add tests)
```

### Test Coverage

```Bash
yarn run test:coverage
```

Running this will run the `mocha` test suite using istanbul's `nyc` cli. Once the tests are complete a test coverage index.html file will be written into *./coverage*. Open this file to examine the test suite's test coverage.

***

## Usage

```sh
daisweb3 <options>
```
### Options:

* `-p` or `--purge`: Empties the current directory.
* `-i` or `--init`: Writes a template .daisconfig file.
* `-a` or `--assemble`: Writes the boilerplate.
* `-y` or `--yes`: Run without asking any questions (will still ask on `--purge`)
* `-o` or `--offline`: Runs ***yarn***/***npm*** add with the ***offline*** flag
* `-c` or `--confirm`: Confirm the command

***

## Implemented Protocols

| Protocol                                                                | ID          | Name          | Support                                                                  |
| ----------------------------------------------------------------------- |:-----------:| ------------: | ------------------------------------------------------------------------ |
| [<img src="./misc/img/dydx.png"/>](https://dydx.exchange/)              | **DYDX**    |  ***DyDx***         | <img src="https://img.shields.io/badge/DyDx-Supported-yellowgreen"/>     |
| [<img src="./misc/img/uniswap-v2.png"/>](https://uniswap.org/)            | **UNISWAP** | ***Uniswap***       | <img src="https://img.shields.io/badge/Uniswap-Supported-yellowgreen"/>  |
| [<img src="./misc/img/1inch.png"/>](https://app.1inch.io/)              | **ONEINCH** | ***1Inch Network*** | <img src="https://img.shields.io/badge/1Inch-Supported-yellowgreen"/>    |
| [<img src="./misc/img/knc.png"/> ](https://kyber.network/about/kyber) | **KYBER**   | ***Kyber Network*** | <img src="https://img.shields.io/badge/Kyber-Supported-yellowgreen"/>    |
| [<img src="./misc/img/bancor.png" />](https://bancor.network/)         | **BANCOR**  | ***Bancor***     | <img src="https://img.shields.io/badge/Bancor-Supported-yellowgreen"/>   |

***

## `.daisconfig`

***template .daisconfig file***
```json
{
  "solversion": "0.8.6",
  "defaultNet": "MAINNET",
  "eslint": true,
  "git": true,
  "contractWriteDir": "/lib/__abis__/artifacts",
  "ganache": true,
  "packman": "yarn",
  "omitTruffleHdWalletProvider": false,
  "ethNodeURL": "wss://mainnet.infura.io/ws/v3/INFURA_URL",
  "contractImports": [
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
```

### *Fields*:

* `solversion`: *Solidity version being used*

This is the Solidity verison that is going to be entered in all the boilerplate contracts:

```solidity
pragma solidity ^{solversion};
```

* `defaultNet`: *Network being used*

This is the parameter the influences which Addresses are written into `./lib/addresses.ts`.
Use `all` to print all addresses for MAINNET and supported test nets.

```typescript
export type SupportedNetwork =
  | 'MAINNET'
  | 'KOVAN'
  | 'ROPSTEN'
  | 'all'
```

* `eslint`: ***bool*** *Whether or not eslint should be configured*

If true `eslint` dependencies will be installed as dev-deps and template `.eslintrc` and `.eslintignore` files will be written in the root of the directory specified as the `path`

* `git`: ***bool*** *Whether or not git should be configured*

If true `git init` will be called and template `.gitignore` and `.gitattributes` files will be written in the directory specified as the `path`

* `contractWriteDir`: ***string*** *The directory going to be entered into the `contracts_build_directory` in the `truffle-config.js` file:*
```javascript
module.exports = {
  contracts_build_directory: {contractWriteDir}
}
```

* `ganache`: ***bool*** *Whether or not ganache-cli should be added as a dev-dep*

If true `ganache-cli` will be installed and a `fork-mainnet.js` file will be written in the root of the directory the dais-web3 command was called from:

***(snippet)***
```javascript
const server = ganache.server({
  port: 7545,
  default_balance_ether: 100,
  fork: new Web3.providers.WebsocketProvider("ETH_NODE_URL"),
  ws: true,
  debug: true,
  vmErrorsOnRPCResponse: true,
  verbose: true,
  logger: console
})

const PORT = 7545

server.listen(PORT, (err, blockchain) => { })
```

* `packman` ***yarn || npm*** *The package manager going to be used to install said dependencies*

Defaults to yarn, fallbacks to npm if yarn fails.

* `omitTruffleHdWalletProvider` ***bool*** Whether or not @truffle/hdwallet-provider should be omitted

If false @truffle/hdwallet-provider is not installed so the truffle-config.js will need to be redone.

* `ethNodeURL`: ***string*** The string going to be printed to an env variable in the `.env` file. This env variable is the variable that will be used in ganache's fork chain (if it was enabled) and as Web3's ***WebSocket*** provider (make sure it's '***wss://***' and ***not*** '***http://***')

* `contractImports` ***Array<IContractImport>***
```typescript
export type SupportedProtocol =
  | 'BANCOR'
  | 'DYDX'
  | 'KYBER'
  | 'ONEINCH'
  | 'UNISWAP'

export interface IContractImport {
  readonly protocol: SupportedProtocol
  readonly pack: string
  readonly omitNpmPack: boolean
  readonly abi: boolean
}
```

<h2 align="center"><i>Fields:</i></h2>

* `protocol` *The DeFi protocol you want to interface with*

* `pack` *The specific import needed from the DeFi protocol*

* `omitNpmPack` *Whether or not the protocol's npm package should be installed*

If true the protocol's npm package (if any) will be installed as a production dependency.

* `abi`: *Whether or not the contract's ABI should be included in the written boilerplate*

***

<h1 align="center"><em><strong>Protocols</em></strong></h1>
<br><br/>

<h1 align="center"><em><strong>BANCOR</strong></em></h2>

| Logo                                  | Support                                                               | Imports              |
| :-----------------------------------: | :-------------------------------------------------------------------: | :------------------: |
| <img src="./misc/img/bancor.png"/>    | <img src="https://img.shields.io/badge/Banor-Supported-yellowgreen"/> | `IBancorNetwork`     |

<br></br>

> While many users benefit from the Bancor Network by using the Bancor App or a Bancor Widget, developers can also access Bancor's many features from their own smart contracts. The [***API reference***](https://docs.bancor.network/guides/interfacing-with-bancor-contracts) section provides a detailed look into the full functionality of each contract in the system. This section will provide a quick look into some more common features and should contain sufficient information for most use cases.

### *Supported Contract Imports*

<br></br>
- <h3 align="center"><em>IBancorNetwork</em></h3>

```json
{
  "protocol": "BANCOR",
  "pack": "IBancorNetwork",
  "omitNpmPack": true,
  "abi": true
}
```

Writes `IContractRegistry.sol` and `IBancorNetwork.sol` files, Bancor's main trading proxy contract interface.

> ### Trading With Bancor
> - `path`: *Network path between sourceToken and toToken*
> The `getPathAndRate` function on the [`Bancor SDK`](https://www.npmjs.com/package/@bancor/sdk) will generate the optimal path for this parameter
>
> - `amount`: *Source token input amount*
>
> - `minReturn`: *To token minimum return*
> 
> - `affiliateAccount`: *Address to direct affiliate fees*
> 
> - `affiliateFee`: *Fee amount (1000 would be equal to 0.1%)*

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "../@OpenZeppelin/IERC20.sol";

interface IBancorNetwork {
  function convertByPath(
    address[] memory _path, 
    uint256 _amount, 
    uint256 _minReturn, 
    address _beneficiary, 
    address _affiliateAccount, 
    uint256 _affiliateFee
  ) external payable returns (uint256);

  function rateByPath(
    address[] memory _path, 
    uint256 _amount
  ) external view returns (uint256);

  function conversionPath(
    IERC20 _sourceToken, 
    IERC20 _targetToken
  ) external view returns (address[] memory);
}
```

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

interface IContractRegistry {
  function addressOf(
    bytes32 contractName
  ) external returns(address);
}
```

***

<br></br>
<h1 align="center"><em><strong>DyDx</strong></em></h2>

| Logo                             | Support                                                              | Imports                               |
| :------------------------------: | :------------------------------------------------------------------: | :-----------------------------------: |
| <img src="./misc/img/dydx.png"/> | <img src="https://img.shields.io/badge/DyDx-Supported-yellowgreen"/> | `Flashloan`                           |

<br></br>

### *Supported Contract Imports*

<br></br>
- <h3 align="center"><em>FlashLoan</em></h3>

```json
{
  "protocol": "DYDX",
  "pack": "Flashloan",
  "omitNpmPack": true,
  "abi": false
}
```

Writes the boilerplate contracts needed to perform a flashloan on DyDx. The boilerplate is adapted from [money-legos]()' DyDx flash loan reference guide.

> Special thanks to kollateral for open sourcing their implementation.
> DyDx does not natively have a "flashloan" feature. However you can achieve a similar behavior by executing a series of operations on the SoloMargin contract. In order to mimic an Aave flashloan on DyDx, you would need to:
>
> 1. Borrow x amount of tokens. (Withdraw)
> 2. Call a function (i.e. Logic to handle flashloaned funds). (Call)
> 3. Deposit back x (+2 wei) amount of tokens. (Deposit)
>
> All within one transaction. The reason this works is because DyDx natively has this feature called operate which allows you to execute a series of operations without checking if the state is valid until the final step. That means that you can withdraw as much funds as you like, do anything with it, as long as you deposit back the funds (and have ~2 Wei of assets in your account) within the same transaction.

If the flashloan option is entered the following starter contract will be written into `Flashloan.sol`:

***(snippet)***
```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;
pragma experimental ABIEncoderV2;

import "./interfaces/@OpenZeppelin/IERC20.sol";
  
import "./interfaces/DyDx/ISoloMargin.sol";
import "./interfaces/DyDx/ICallee.sol";

import "./libraries/DyDx/Actions.sol";
import "./libraries/DyDx/Account.sol";
      
contract FlashLoan is ICallee {
  mapping(address => uint) public DyDxCurrencyMarketIDs;
  address immutable SoloAddress;

  constructor(
    address ISoloMarginAddress, address USDC,
    address WETH, address DAI, address SAI
  ) { }
        
  struct CallFuncParam {
    uint256 amount;
    address currency;
  }

  function callFunction(
    address _sender,
    Account.Info calldata _accountInfo,
    bytes calldata _data
  ) external override {
    CallFuncParam memory data = abi.decode(_data, (CallFuncParam));

  }
      
  function flashloan(
    CallFuncParam calldata param
  ) external {
    Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

    ...

    this.SoloFac().operate(accountInfos, operations);
  }
      
  function SoloFac() external view returns(ISoloMargin solo) {
    return ISoloMargin(SoloAddress);
  }
}
```

***

<br><br/>
<h1 align="center"><em><strong>KYBER</strong></em></h2>

| Logo                                      | Support                                                               | Imports              |
| :---------------------------------------: | :-------------------------------------------------------------------: | :------------------: |
| <img src="./misc/img/kyber-network.png"/> | <img src="https://img.shields.io/badge/Kyber-Supported-yellowgreen"/> | `IKyberNetworkProxy` |

<br></br>

### *Supported Contract Imports*

<br></br>
- <h3 align="center"><em>IKyberNetworkProxy</em></h3>

```json
{
  "protocol": "KYBER",
  "pack": "IKyberNetworkProxy",
  "omitNpmPack": true,
  "abi": true
}
```

Writes an `IKyberNetworkProxy.sol` file, Kyber main proxy contract interface.

> contract `KyberNetworkProxy`
>
> is [`IKyberNetworkProxy`](https://developer.kyber.network/docs/API_ABI-IKyberNetworkProxy), [`ISimpleKyberProxy`](https://developer.kyber.network/docs/API_ABI-ISimpleKyberProxy), `WithdrawableNoModifiers`, `Utils5`
> imports `WithdrawableNoModifiers`, `Utils5`, `SafeERC20`, [`IKyberNetwork`](https://developer.kyber.network/docs/API_ABI-IKyberNetwork), [`IKyberNetworkProxy`](https://developer.kyber.network/docs/API_ABI-IKyberNetworkProxy), [`ISimpleKyberProxy`](https://developer.kyber.network/docs/API_ABI-ISimpleKyberProxy), [`IKyberHint`](https://developer.kyber.network/docs/API_ABI-IKyberHint)
>
> Source: [`KyberNetworkProxy.sol`](https://github.com/KyberNetwork/smart-contracts/blob/master/contracts/sol6/KyberNetworkProxy.sol)

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "../@OpenZeppelin/IERC20.sol";

interface IKyberNetworkProxy {

  event ExecuteTrade(
    address indexed trader,
    IERC20 src,
    IERC20 dest,
    address destAddress,
    uint256 actualSrcAmount,
    uint256 actualDestAmount,
    address platformWallet,
    uint256 platformFeeBps
  );

  /// @notice backward compatible
  function tradeWithHint(
    ERC20 src,
    uint256 srcAmount,
    ERC20 dest,
    address payable destAddress,
    uint256 maxDestAmount,
    uint256 minConversionRate,
    address payable walletId,
    bytes calldata hint
  ) external payable returns (uint256);

  function tradeWithHintAndFee(
    IERC20 src,
    uint256 srcAmount,
    IERC20 dest,
    address payable destAddress,
    uint256 maxDestAmount,
    uint256 minConversionRate,
    address payable platformWallet,
    uint256 platformFeeBps,
    bytes calldata hint
  ) external payable returns (uint256 destAmount);

  function trade(
    IERC20 src,
    uint256 srcAmount,
    IERC20 dest,
    address payable destAddress,
    uint256 maxDestAmount,
    uint256 minConversionRate,
    address payable platformWallet
  ) external payable returns (uint256);

  /// @notice backward compatible
  /// @notice Rate units (10 ** 18) => destQty (twei) / srcQty (twei) * 10 ** 18
  function getExpectedRate(
    ERC20 src,
    ERC20 dest,
    uint256 srcQty
  ) external view returns (uint256 expectedRate, uint256 worstRate);

  function getExpectedRateAfterFee(
    IERC20 src,
    IERC20 dest,
    uint256 srcQty,
    uint256 platformFeeBps,
    bytes calldata hint
  ) external view returns (uint256 expectedRate);
}
```

***

<br><br/>
<h1 align="center"><em><strong>ONEINCH</strong></em></h2>

| Logo                               | Support                                                                 | Imports                      |
| :--------------------------------: | :---------------------------------------------------------------------: | :--------------------------: |
| <img src="./misc/img/1inch2.png"/> | <img src="https://img.shields.io/badge/OneInch-Supported-yellowgreen"/> | `OneInch`, `OneInchMulti`    |

> To use this service you have to call methods at [`OneSplitAudit`](https://github.com/CryptoManiacsZone/1inchProtocol/blob/master/contracts/OneSplitAudit.sol)
>
> ![](./misc/img/oneinch_tut.png)
>
> ## How to use it
>
> To swap tokens you have to figure out way from left to right points by one of paths on scheme above.
>
> For example, first of all call method getExpectedReturn (see methods section), it returns distribution array. Each element of this array matches element of splitExchanges (see above) and represents fraction of trading volume.
> Then call getExpectedReturnWithGas to take into account gas when splitting. This method returns more profitable distribution array for exchange.
> Then call method swap or swapWithReferral (see methods section) with param distribution which was recieved earlier from method getExpectedReturn.
>
> Swap may be customized by flags (see flags section). There are 2 types of swap: direct swap and swap over transitional token.
>
> In case of direct swap each element of distribution array matches element of splitExchanges and represents fraction of trading off token as alerady described above.
>
> In case of swap with transitional token each element of distribution (256 bits) matches 2 swaps: second bytes are equal to swap to transitional token, lowest bytes are equal to swap to the desired token.

<br></br>

### *Supported Contract Imports*

<br></br>
- <h3 align="center"><em>OneInch</em></h3>

```json
{
  "protocol": "ONEINCH",
  "pack": "OneInch",
  "omitNpmPack": true,
  "abi": true
}
```

Writes an `IOneSplit.sol` contract interface, OneInch's main trading interface (for token to token) see `IOneSplitMulti.sol`.

***(snippet)***

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.6;

import "../@OpenZeppelin/IERC20.sol";

...

interface IOneSplit {
  function getExpectedReturn(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 parts,
    uint256 flags // See constants in IOneSplit.sol
  ) external view returns(
    uint256 returnAmount,
    uint256[] memory distribution
  );

  function getExpectedReturnWithGas(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 parts,
    uint256 flags, // See constants in IOneSplit.sol
    uint256 destTokenEthPriceTimesGasPrice
  ) external view returns(
    uint256 returnAmount,
    uint256 estimateGasAmount,
    uint256[] memory distribution
  );

  function swap(
    IERC20 fromToken,
    IERC20 destToken,
    uint256 amount,
    uint256 minReturn,
    uint256[] memory distribution,
    uint256 flags
  ) external payable returns(uint256 returnAmount);
}
```

<br></br>
- <h3 align="center"><em>OneInchMulti</em></h3>

```json
{
  "protocol": "ONEINCH",
  "pack": "OneInchMulti",
  "omitNpmPack": true,
  "abi": true
}
```

Writes an `IOneSplitMulti` contract interface and an `IOneSplit` contract interface. *(If `IOneSplit` is not imported an `IOneSplit` contract will be written anyway)*.

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.6;

import "../@OpenZeppelin/IERC20.sol";
import "./IOneSplit.sol";

interface IOneSplitMulti is IOneSplit {
  function getExpectedReturnWithGasMulti(
    IERC20[] memory tokens,
    uint256 amount,
    uint256[] memory parts,
    uint256[] memory flags,
    uint256[] memory destTokenEthPriceTimesGasPrices
  )
    external view returns(
      uint256[] memory returnAmounts,
      uint256 estimateGasAmount,
      uint256[] memory distribution
    );

  function swapMulti(
    IERC20[] memory tokens,
    uint256 amount,
    uint256 minReturn,
    uint256[] memory distribution,
    uint256[] memory flags
  )
    external payable returns(uint256 returnAmount);
}
```

***

<br><br/>
<h1 align="center"><em><strong>Uniswap</strong></em></h2>

| Logo                                 | Support                                                                   | Imports                     | 
:----------------------------------: | :-----------------------------------------------------------------------: | :---------------------------: |
| <img src="./misc/img/uniswap-v2.png"/> | <img src="https://img.shields.io/badge/Uniswap-Supported-yellowgreen"/> | `V2Router`                  |

<br></br>

### *Supported Contract Imports*

<br></br>
- <h3 align="center"><em>V2Router</em></h3>

```json
{
  "protocol": "UNISWAP",
  "pack": "V2Router",
  "omitNpmPack": true,
  "abi": true
}
```

Writes `IUniswapV2Router01.sol` and `IUniswapV2Router02.sol` files, Uniswap's main trading contract interfaces. 

> Because routers are stateless and do not hold token balances, they can be replaced safely and trustlessly, if necessary. This may happen if more efficient smart contract patterns are discovered, or if additional functionality is desired. For this reason, routers have release numbers, starting at `01`. This is currently recommended release, `02`.

For more visit [`V2Router02`](https://uniswap.org/docs/v2/smart-contracts/router02/)

***(snippet)***

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.2;

interface IUniswapV2Router01 {
  function factory() external pure returns (address);

  function WETH() external pure returns (address);

  function addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
  )
    external
    returns (
      uint256 amountA,
      uint256 amountB,
      uint256 liquidity
    );

  ...

  function removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
  ) external returns (uint256 amountA, uint256 amountB);

  ...

  function swapExactTokensForTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external returns (uint256[] memory amounts);

  ...

  function swapExactETHForTokens(
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external payable returns (uint256[] memory amounts);

  ...

  function getAmountsOut(uint256 amountIn, address[] calldata path)
    external
    view
    returns (uint256[] memory amounts);
}
```

***(snippet)***

```solidity
// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.6.2;

import "./IUniswapV2Router01.sol";

interface IUniswapV2Router02 is IUniswapV2Router01 {
  function removeLiquidityETHSupportingFeeOnTransferTokens(
    address token,
    uint256 liquidity,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline
  ) external returns (uint256 amountETH);

  ...

  function swapExactTokensForTokensSupportingFeeOnTransferTokens(
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external;
}

```

***

<br/>

## Author

👤 **Sihle Masebuku <snts.abode@gmail.com>**


## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
