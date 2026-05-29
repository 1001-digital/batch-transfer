import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

export default buildModule('BatchTransfer', (m) => {
  const batchTransfer = m.contract('BatchTransfer')
  return { batchTransfer }
})
