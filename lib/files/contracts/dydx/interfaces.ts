export const ICallee = (
  solver: string
): string => `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^${solver};
pragma experimental ABIEncoderV2;

import "../../libraries/DyDx/Account.sol";

interface ICallee {
  function callFunction(address sender, Account.Info calldata accountInfo, bytes calldata data) external;
}
`.trim()

export const ISoloMargin = (
  solver: string
): string => `
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^${solver};
pragma experimental ABIEncoderV2;

import "../../libraries/DyDx/Account.sol";
import "../../libraries/DyDx/Actions.sol";

interface ISoloMargin {
  function operate(Account.Info[] calldata accounts, Actions.ActionArgs[] calldata actions) external;
}
`.trim()