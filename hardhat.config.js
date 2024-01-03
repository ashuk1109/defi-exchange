require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL

module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.19" },
      { version: "0.4.19" },
      { version: "0.6.12" }],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
};
