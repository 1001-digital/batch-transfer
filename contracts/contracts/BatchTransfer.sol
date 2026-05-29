// SPDX-License-Identifier: MIT
pragma solidity 0.8.34;

import {SafeTransferLib} from 'solady/src/utils/SafeTransferLib.sol';
import {IERC721} from './interfaces/IERC721.sol';
import {IERC1155} from './interfaces/IERC1155.sol';

/// @title  BatchTransfer
/// @author 1001
/// @notice Move many ERC-20, ERC-721, or ERC-1155 tokens in a single
///         transaction — to one recipient, or to many in parallel.
/// @dev    Tokens always move *from* `msg.sender`. Before calling, approve this
///         contract on the token contract:
///           - ERC-721 / ERC-1155: `setApprovalForAll(batchTransfer, true)`
///           - ERC-20: `approve(batchTransfer, amount)`
///         The contract is stateless, custodies nothing, has no owner, and holds
///         no privileged role — it is safe to grant a blanket approval to.
///         Inspired by Aleph Retamal's ERC721BatchTransfer, rebuilt for all three
///         mainstream token standards with Solady's `SafeTransferLib` and custom
///         errors.
contract BatchTransfer {
    using SafeTransferLib for address;

    /// @dev Two parallel input arrays had mismatched lengths.
    error LengthMismatch();
    /// @dev A batch was submitted with zero entries.
    error EmptyBatch();

    event ERC20BatchTransferred(
        address indexed token,
        address indexed from,
        uint256 recipients
    );
    event ERC721BatchTransferred(
        address indexed token,
        address indexed from,
        uint256 quantity
    );
    event ERC1155BatchTransferred(
        address indexed token,
        address indexed from,
        uint256 quantity
    );

    // ---------------------------------------------------------------------
    // ERC-20
    // ---------------------------------------------------------------------

    /// @notice Send a distinct ERC-20 amount to each of many recipients.
    /// @dev `recipients[i]` receives `amounts[i]`. Uses Solady's
    ///      `SafeTransferLib` so non-standard tokens (e.g. USDT) that return no
    ///      boolean still work.
    /// @param token the ERC-20 token to distribute
    /// @param recipients addresses that will receive tokens
    /// @param amounts amount paired with each recipient, same length/order
    function batchTransferERC20(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        uint256 length = recipients.length;
        if (length == 0) revert EmptyBatch();
        if (amounts.length != length) revert LengthMismatch();

        for (uint256 i; i < length; ) {
            token.safeTransferFrom(msg.sender, recipients[i], amounts[i]);
            unchecked {
                ++i;
            }
        }

        emit ERC20BatchTransferred(token, msg.sender, length);
    }

    /// @notice Send the same ERC-20 amount to every recipient (equal airdrop).
    /// @param token the ERC-20 token to distribute
    /// @param recipients addresses that will each receive `amount`
    /// @param amount the amount delivered to every recipient
    function batchTransferERC20Equal(
        address token,
        address[] calldata recipients,
        uint256 amount
    ) external {
        uint256 length = recipients.length;
        if (length == 0) revert EmptyBatch();

        for (uint256 i; i < length; ) {
            token.safeTransferFrom(msg.sender, recipients[i], amount);
            unchecked {
                ++i;
            }
        }

        emit ERC20BatchTransferred(token, msg.sender, length);
    }

    // ---------------------------------------------------------------------
    // ERC-721
    // ---------------------------------------------------------------------

    /// @notice Transfer many ERC-721 tokens to a single recipient.
    /// @dev Uses `transferFrom`. If the recipient is a contract that cannot
    ///      handle ERC-721 tokens, use `safeBatchTransferERC721` instead.
    /// @param token the ERC-721 contract
    /// @param to the address that will receive every token
    /// @param tokenIds the tokens to transfer
    function batchTransferERC721(
        IERC721 token,
        address to,
        uint256[] calldata tokenIds
    ) external {
        uint256 length = tokenIds.length;
        if (length == 0) revert EmptyBatch();

        for (uint256 i; i < length; ) {
            token.transferFrom(msg.sender, to, tokenIds[i]);
            unchecked {
                ++i;
            }
        }

        emit ERC721BatchTransferred(address(token), msg.sender, length);
    }

    /// @notice Transfer many ERC-721 tokens to a single recipient, safely.
    /// @dev Uses `safeTransferFrom`, invoking `onERC721Received` on contract
    ///      recipients.
    /// @param token the ERC-721 contract
    /// @param to the address that will receive every token
    /// @param tokenIds the tokens to transfer
    function safeBatchTransferERC721(
        IERC721 token,
        address to,
        uint256[] calldata tokenIds
    ) external {
        uint256 length = tokenIds.length;
        if (length == 0) revert EmptyBatch();

        for (uint256 i; i < length; ) {
            token.safeTransferFrom(msg.sender, to, tokenIds[i]);
            unchecked {
                ++i;
            }
        }

        emit ERC721BatchTransferred(address(token), msg.sender, length);
    }

    /// @notice Transfer ERC-721 tokens to many recipients in parallel.
    /// @dev `recipients[i]` receives `tokenIds[i]`. Uses `transferFrom`.
    /// @param token the ERC-721 contract
    /// @param recipients addresses that will receive tokens
    /// @param tokenIds the tokens to transfer, paired by index with recipients
    function batchTransferERC721ToMany(
        IERC721 token,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external {
        uint256 length = tokenIds.length;
        if (length == 0) revert EmptyBatch();
        if (recipients.length != length) revert LengthMismatch();

        for (uint256 i; i < length; ) {
            token.transferFrom(msg.sender, recipients[i], tokenIds[i]);
            unchecked {
                ++i;
            }
        }

        emit ERC721BatchTransferred(address(token), msg.sender, length);
    }

    /// @notice Transfer ERC-721 tokens to many recipients in parallel, safely.
    /// @dev `recipients[i]` receives `tokenIds[i]`. Uses `safeTransferFrom`.
    /// @param token the ERC-721 contract
    /// @param recipients addresses that will receive tokens
    /// @param tokenIds the tokens to transfer, paired by index with recipients
    function safeBatchTransferERC721ToMany(
        IERC721 token,
        address[] calldata recipients,
        uint256[] calldata tokenIds
    ) external {
        uint256 length = tokenIds.length;
        if (length == 0) revert EmptyBatch();
        if (recipients.length != length) revert LengthMismatch();

        for (uint256 i; i < length; ) {
            token.safeTransferFrom(msg.sender, recipients[i], tokenIds[i]);
            unchecked {
                ++i;
            }
        }

        emit ERC721BatchTransferred(address(token), msg.sender, length);
    }

    // ---------------------------------------------------------------------
    // ERC-1155
    // ---------------------------------------------------------------------

    /// @notice Transfer many ERC-1155 token types to a single recipient.
    /// @dev Delegates to the token's native `safeBatchTransferFrom`.
    /// @param token the ERC-1155 contract
    /// @param to the address that will receive every token
    /// @param ids the token type ids to transfer
    /// @param amounts the amount of each id to transfer, paired by index
    function batchTransferERC1155(
        IERC1155 token,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external {
        uint256 length = ids.length;
        if (length == 0) revert EmptyBatch();
        if (amounts.length != length) revert LengthMismatch();

        token.safeBatchTransferFrom(msg.sender, to, ids, amounts, '');

        emit ERC1155BatchTransferred(address(token), msg.sender, length);
    }

    /// @notice Transfer ERC-1155 tokens to many recipients in parallel.
    /// @dev `recipients[i]` receives `amounts[i]` of `ids[i]`.
    /// @param token the ERC-1155 contract
    /// @param recipients addresses that will receive tokens
    /// @param ids the token type ids to transfer, paired by index
    /// @param amounts the amount of each id to transfer, paired by index
    function batchTransferERC1155ToMany(
        IERC1155 token,
        address[] calldata recipients,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external {
        uint256 length = ids.length;
        if (length == 0) revert EmptyBatch();
        if (recipients.length != length || amounts.length != length) {
            revert LengthMismatch();
        }

        for (uint256 i; i < length; ) {
            token.safeTransferFrom(
                msg.sender,
                recipients[i],
                ids[i],
                amounts[i],
                ''
            );
            unchecked {
                ++i;
            }
        }

        emit ERC1155BatchTransferred(address(token), msg.sender, length);
    }
}
