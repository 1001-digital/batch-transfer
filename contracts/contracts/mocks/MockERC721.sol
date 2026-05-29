// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {ERC721} from 'solady/src/tokens/ERC721.sol';
import {LibString} from 'solady/src/utils/LibString.sol';

contract MockERC721 is ERC721 {
    using LibString for uint256;

    function name() public pure override returns (string memory) {
        return 'Mock ERC721';
    }

    function symbol() public pure override returns (string memory) {
        return 'M721';
    }

    function tokenURI(
        uint256 id
    ) public pure override returns (string memory) {
        return string.concat('https://example.com/', id.toString());
    }

    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}
