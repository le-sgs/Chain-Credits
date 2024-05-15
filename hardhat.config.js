require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Update this to match Ganache GUI's RPC server
      chainId: 1337, // This matches your Ganache GUI network ID
      accounts: {
        mnemonic: "zebra mule neck menu ketchup cage library useful gift cheese cradle size",
      }
    }
  }
};
