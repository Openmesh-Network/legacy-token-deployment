import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "./scripts/multisig";

import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const fakePrivKey = "0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.23",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1_000_000,
          },
        },
      },
    ],
  },
  networks: {
    sepolia: {
      accounts: [process.env.PRIV_KEY ?? fakePrivKey],
      url: process.env.RPC_SEPOLIA ?? "https://rpc.ankr.com/eth_sepolia",
      verify: {
        etherscan: {
          apiKey: process.env.X_ETHERSCAN_API_KEY ?? "",
        },
      },
    },
    mainnet: {
      accounts: [process.env.PRIV_KEY ?? fakePrivKey],
      url: process.env.RPC_ETHEREUM ?? "https://rpc.ankr.com/eth",
      verify: {
        etherscan: {
          apiKey: process.env.X_ETHERSCAN_API_KEY ?? "",
        },
      },
    },
  },
};

export default config;
