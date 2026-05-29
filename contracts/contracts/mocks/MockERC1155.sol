// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ERC1155} from 'solady/src/tokens/ERC1155.sol';

contract MockERC1155 is ERC1155 {
    function uri(uint256) public pure override returns (string memory) {
        return 'https://example.com/{id}.json';
    }

    function mint(address to, uint256 id, uint256 amount) external {
        _mint(to, id, amount, '');
    }
}
