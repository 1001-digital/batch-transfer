// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ERC20} from 'solady/src/tokens/ERC20.sol';

contract MockERC20 is ERC20 {
    function name() public pure override returns (string memory) {
        return 'Mock ERC20';
    }

    function symbol() public pure override returns (string memory) {
        return 'M20';
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
