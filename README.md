# DeFi Exchange

This project demonstrates a DeFi Contract using the Aave DeFi exchange. 

Contract Flow (Aave) :
1. Deposit some collateral
2. Borrow some asset
3. Repay the asset 

Instead of using local network, we have used mainnet fork, to replicate the contract behavior locally at our end.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
npx hardhat node
npx hardhat run scripts/aaveBorrow.js
```

Big thanks to *Patrick Collins* for his web3 course.
