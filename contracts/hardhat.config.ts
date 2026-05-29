import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem'
import { configVariable, defineConfig } from 'hardhat/config'

const soliditySettings = {
  evmVersion: 'cancun',
  viaIR: true,
  optimizer: {
    enabled: true,
    // The contract is a hot path for airdrops/migrations — bias the
    // optimizer toward cheap runtime calls over small deploy bytecode.
    runs: 999999,
  },
} as const

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: { version: '0.8.34', settings: soliditySettings },
      production: { version: '0.8.34', settings: soliditySettings },
    },
  },
  networks: {
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('DEPLOYER_PRIVATE_KEY')],
    },
    mainnet: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('MAINNET_RPC_URL'),
      accounts: [configVariable('DEPLOYER_PRIVATE_KEY')],
    },
  },
  verify: {
    etherscan: {
      apiKey: configVariable('ETHERSCAN_API_KEY'),
    },
  },
})
