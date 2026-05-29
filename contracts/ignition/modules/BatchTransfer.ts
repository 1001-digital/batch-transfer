import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

// Canonical ENS L1 Reverse Registrar on Ethereum mainnet. Override per network
// with a `--parameters` file (see `ignition/parameters/`); pass the zero
// address to skip ENS registration on chains without a reverse registrar.
const MAINNET_REVERSE_REGISTRAR =
  '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb'

export default buildModule('BatchTransfer', (m) => {
  const reverseRegistrar = m.getParameter(
    'reverseRegistrar',
    MAINNET_REVERSE_REGISTRAR,
  )
  const batchTransfer = m.contract('BatchTransfer', [reverseRegistrar])
  return { batchTransfer }
})
