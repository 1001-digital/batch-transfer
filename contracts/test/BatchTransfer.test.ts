import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import { network } from 'hardhat'
import { getAddress, parseEther } from 'viem'

// One network connection / deploy per `describe` keeps tests fast while still
// isolating each standard. Wallet clients: [deployer, alice, bob, carol].
async function deploy() {
  const connection: any = await network.create()
  const { viem } = connection
  const [deployer, alice, bob, carol] = await viem.getWalletClients()
  const batch = await viem.deployContract('BatchTransfer')
  return { connection, viem, batch, deployer, alice, bob, carol }
}

type Ctx = Awaited<ReturnType<typeof deploy>>

const addr = (wallet: any) => getAddress(wallet.account.address)

describe('BatchTransfer · ERC-20', () => {
  let ctx: Ctx
  let token: any

  before(async () => {
    ctx = await deploy()
    token = await ctx.viem.deployContract('MockERC20')
    // Fund alice and let the batch contract pull from her.
    await token.write.mint([addr(ctx.alice), parseEther('1000')])
    const tokenAsAlice = await ctx.viem.getContractAt(
      'MockERC20',
      token.address,
      { client: { wallet: ctx.alice } },
    )
    await tokenAsAlice.write.approve([ctx.batch.address, parseEther('1000')])
  })

  it('distributes distinct amounts to many recipients', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await batchAsAlice.write.batchTransferERC20([
      token.address,
      [addr(ctx.bob), addr(ctx.carol)],
      [parseEther('30'), parseEther('70')],
    ])

    assert.equal(await token.read.balanceOf([addr(ctx.bob)]), parseEther('30'))
    assert.equal(
      await token.read.balanceOf([addr(ctx.carol)]),
      parseEther('70'),
    )
  })

  it('distributes an equal amount to many recipients', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    const before = (await token.read.balanceOf([addr(ctx.bob)])) as bigint
    await batchAsAlice.write.batchTransferERC20Equal([
      token.address,
      [addr(ctx.bob), addr(ctx.carol)],
      parseEther('5'),
    ])

    assert.equal(
      ((await token.read.balanceOf([addr(ctx.bob)])) as bigint) - before,
      parseEther('5'),
    )
  })

  it('reverts on mismatched array lengths', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await ctx.viem.assertions.revertWithCustomError(
      batchAsAlice.write.batchTransferERC20([
        token.address,
        [addr(ctx.bob), addr(ctx.carol)],
        [parseEther('1')],
      ]),
      ctx.batch,
      'LengthMismatch',
    )
  })

  it('reverts on an empty batch', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await ctx.viem.assertions.revertWithCustomError(
      batchAsAlice.write.batchTransferERC20([token.address, [], []]),
      ctx.batch,
      'EmptyBatch',
    )
  })

  it('reverts when the sender has not approved the contract', async () => {
    // Carol owns nothing and has not approved — the SafeERC20 pull fails.
    const batchAsCarol = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.carol } },
    )

    await assert.rejects(
      batchAsCarol.write.batchTransferERC20([
        token.address,
        [addr(ctx.bob)],
        [parseEther('1')],
      ]),
    )
  })
})

describe('BatchTransfer · ERC-721', () => {
  let ctx: Ctx
  let token: any

  before(async () => {
    ctx = await deploy()
    token = await ctx.viem.deployContract('MockERC721')
    for (const id of [1n, 2n, 3n, 4n]) {
      await token.write.mint([addr(ctx.alice), id])
    }
    const tokenAsAlice = await ctx.viem.getContractAt(
      'MockERC721',
      token.address,
      { client: { wallet: ctx.alice } },
    )
    await tokenAsAlice.write.setApprovalForAll([ctx.batch.address, true])
  })

  it('transfers many tokens to a single recipient', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await batchAsAlice.write.batchTransferERC721([
      token.address,
      addr(ctx.bob),
      [1n, 2n],
    ])

    assert.equal(await token.read.ownerOf([1n]), addr(ctx.bob))
    assert.equal(await token.read.ownerOf([2n]), addr(ctx.bob))
  })

  it('transfers tokens to many recipients in parallel', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await batchAsAlice.write.batchTransferERC721ToMany([
      token.address,
      [addr(ctx.bob), addr(ctx.carol)],
      [3n, 4n],
    ])

    assert.equal(await token.read.ownerOf([3n]), addr(ctx.bob))
    assert.equal(await token.read.ownerOf([4n]), addr(ctx.carol))
  })

  it('reverts safe transfer to a non-receiver contract', async () => {
    // Mint a fresh token and point a safe transfer at a contract that does
    // not implement `onERC721Received` (the ERC-1155 mock).
    await token.write.mint([addr(ctx.alice), 99n])
    const nonReceiver = await ctx.viem.deployContract('MockERC1155')
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await assert.rejects(
      batchAsAlice.write.safeBatchTransferERC721([
        token.address,
        nonReceiver.address,
        [99n],
      ]),
    )
    // Ownership unchanged — the whole batch reverted atomically.
    assert.equal(await token.read.ownerOf([99n]), addr(ctx.alice))
  })

  it('reverts on mismatched array lengths', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await ctx.viem.assertions.revertWithCustomError(
      batchAsAlice.write.batchTransferERC721ToMany([
        token.address,
        [addr(ctx.bob)],
        [1n, 2n],
      ]),
      ctx.batch,
      'LengthMismatch',
    )
  })

  it('reverts when the caller does not own a token', async () => {
    // Bob now owns 1 and 2; carol approves but owns nothing relevant.
    const batchAsCarol = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.carol } },
    )

    await assert.rejects(
      batchAsCarol.write.batchTransferERC721([
        token.address,
        addr(ctx.carol),
        [1n],
      ]),
    )
  })
})

describe('BatchTransfer · ERC-1155', () => {
  let ctx: Ctx
  let token: any

  before(async () => {
    ctx = await deploy()
    token = await ctx.viem.deployContract('MockERC1155')
    await token.write.mint([addr(ctx.alice), 1n, 100n])
    await token.write.mint([addr(ctx.alice), 2n, 100n])
    const tokenAsAlice = await ctx.viem.getContractAt(
      'MockERC1155',
      token.address,
      { client: { wallet: ctx.alice } },
    )
    await tokenAsAlice.write.setApprovalForAll([ctx.batch.address, true])
  })

  it('transfers many ids to a single recipient', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await batchAsAlice.write.batchTransferERC1155([
      token.address,
      addr(ctx.bob),
      [1n, 2n],
      [10n, 20n],
    ])

    assert.equal(await token.read.balanceOf([addr(ctx.bob), 1n]), 10n)
    assert.equal(await token.read.balanceOf([addr(ctx.bob), 2n]), 20n)
  })

  it('transfers ids to many recipients in parallel', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await batchAsAlice.write.batchTransferERC1155ToMany([
      token.address,
      [addr(ctx.bob), addr(ctx.carol)],
      [1n, 2n],
      [5n, 7n],
    ])

    assert.equal(await token.read.balanceOf([addr(ctx.carol), 2n]), 7n)
  })

  it('reverts on mismatched array lengths', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await ctx.viem.assertions.revertWithCustomError(
      batchAsAlice.write.batchTransferERC1155ToMany([
        token.address,
        [addr(ctx.bob), addr(ctx.carol)],
        [1n],
        [5n],
      ]),
      ctx.batch,
      'LengthMismatch',
    )
  })

  it('reverts on an empty batch', async () => {
    const batchAsAlice = await ctx.viem.getContractAt(
      'BatchTransfer',
      ctx.batch.address,
      { client: { wallet: ctx.alice } },
    )

    await ctx.viem.assertions.revertWithCustomError(
      batchAsAlice.write.batchTransferERC1155([
        token.address,
        addr(ctx.bob),
        [],
        [],
      ]),
      ctx.batch,
      'EmptyBatch',
    )
  })
})
