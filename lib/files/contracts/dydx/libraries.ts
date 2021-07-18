export const Account = (
  solver: string
): string => `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^${solver};

library Account {
  struct Info {
    address owner;
    uint256 number;
  }
}
`.trim()

export const Actions = (
  solver: string
): string => `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^${solver};

import "./Types.sol";

library Actions {
  enum ActionType { Deposit, Withdraw, Transfer, Buy, Sell, Trade, Liquidate, Vaporize, Call }

  struct ActionArgs {
    ActionType actionType;
    uint256 accountId;
    Types.AssetAmount amount;
    uint256 primaryMarketId;
    uint256 secondaryMarketId;
    address otherAddress;
    uint256 otherAccountId;
    bytes data;
  }
}
`.trim()

export const Types = (
  solver: string
): string => `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^${solver};

library Types {
  enum AssetDenomination { Wei, Par }
  enum AssetReference { Delta, Target }

  struct AssetAmount {
    bool sign;
    AssetDenomination denomination;
    AssetReference ref;
    uint256 value;
  }
}
`

export const FlashloanBoilerplate = (
  solver: string
): string => `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^${solver};
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
  ) {
    IERC20(USDC).approve(ISoloMarginAddress, type(uint256).max);
    IERC20(WETH).approve(ISoloMarginAddress, type(uint256).max); // Use WETH contract
    IERC20(DAI).approve(ISoloMarginAddress, type(uint256).max);
    IERC20(SAI).approve(ISoloMarginAddress, type(uint256).max);
    SoloAddress = ISoloMarginAddress;

    DyDxCurrencyMarketIDs[WETH] = 0;
    DyDxCurrencyMarketIDs[SAI] = 1;
    DyDxCurrencyMarketIDs[USDC] = 2;
    DyDxCurrencyMarketIDs[DAI] = 3;
  }
  
  // Add desired parameters here
  struct CallFuncParam {
    uint256 amount;
    address currency;
  }

  function callFunction(
    address _sender,
    Account.Info calldata _accountInfo,
    bytes calldata _data
  ) external override {
    // Parameters encoded in 'flashloan'
    CallFuncParam memory data = abi.decode(_data, (CallFuncParam));

    // Enter your custom logic here
  }
  
  // Function meant to be called by the bot
  function flashloan(
    CallFuncParam calldata param
  ) external {
    Actions.ActionArgs[] memory operations = new Actions.ActionArgs[](3);

    operations[0] = Actions.ActionArgs({
      actionType: Actions.ActionType.Withdraw,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: false,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: param.amount
      }),
      primaryMarketId: DyDxCurrencyMarketIDs[param.currency],
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      data: ""
    });
      
    operations[1] = Actions.ActionArgs({
      actionType: Actions.ActionType.Call,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: false,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: 0
      }),
      primaryMarketId: 0,
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      // add variables that have to available to the receiver function here
      data: abi.encode(param)
    });
      
    operations[2] = Actions.ActionArgs({
      actionType: Actions.ActionType.Deposit,
      accountId: 0,
      amount: Types.AssetAmount({
        sign: true,
        denomination: Types.AssetDenomination.Wei,
        ref: Types.AssetReference.Delta,
        value: param.amount + 2
      }),
      primaryMarketId: DyDxCurrencyMarketIDs[param.currency],
      secondaryMarketId: 0,
      otherAddress: address(this),
      otherAccountId: 0,
      data: ""
    });
      
    Account.Info[] memory accountInfos = new Account.Info[](1);
    accountInfos[0] = Account.Info({ owner: address(this), number: 1 });

    this.SoloFac().operate(accountInfos, operations);
  }
      
  function SoloFac() external view returns(ISoloMargin solo) {
    return ISoloMargin(SoloAddress);
  }
}
`.trim()