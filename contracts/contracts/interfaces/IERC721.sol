// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

/// @dev Minimal ERC-721 interface — only the transfer entrypoints
///      `BatchTransfer` calls. Tokens are pulled from `msg.sender`, never
///      custodied.
interface IERC721 {
    function transferFrom(address from, address to, uint256 tokenId) external;

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
}
