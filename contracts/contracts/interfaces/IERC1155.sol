// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

/// @dev Minimal ERC-1155 interface — only the transfer entrypoints
///      `BatchTransfer` calls.
interface IERC1155 {
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external;

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external;
}
