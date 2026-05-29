import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

// Defaults for Ethereum mainnet. Override per network with a `--parameters`
// file (see `ignition/parameters/`); pass the zero address (or an empty name)
// to skip ENS registration on chains without a reverse registrar.
const MAINNET_REVERSE_REGISTRAR =
  '0xa58E81fe9b61B5c3fE2AFD33CF304c454AbFc7Cb'
const DEFAULT_ENS_NAME = 'batchtransfer.eth'

export default buildModule('BatchTransfer', (m) => {
  const reverseRegistrar = m.getParameter(
    'reverseRegistrar',
    MAINNET_REVERSE_REGISTRAR,
  )
  const ensName = m.getParameter('ensName', DEFAULT_ENS_NAME)
  const batchTransfer = m.contract('BatchTransfer', [reverseRegistrar, ensName])
  return { batchTransfer }
})
