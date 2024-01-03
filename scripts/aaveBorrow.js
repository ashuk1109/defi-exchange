const { ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")
const { networkConfig } = require("../helper-hardhat-config")

async function main() {

    await getWeth()

    const accounts = await ethers.getSigners()
    const deployer = accounts[0]

    const lendingPool = await getLendingPool(deployer)

    // 1. Deposit
    const wethTokenAddress = networkConfig[31337].wethTokenAddress
    await approveERC20(wethTokenAddress, lendingPool.target, AMOUNT, deployer)
    console.log("Depositing... ");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited");

    // 2. Borrow
    let { availableBorrowsETH, totalDebtETH } =
        await getBorrowUserData(lendingPool, deployer)
    // we will be borrowing DAI token here, so need to get exchange rate of DAI to ETH
    const daiPrice = await getDAIPrice()
    const amountToBorrowInDAI =
        availableBorrowsETH.toString() * 0.95 * (1 / Number(daiPrice))
    console.log(`You can borrow ${amountToBorrowInDAI} DAI`);
    const amountToBorrowWEI = ethers.parseEther(amountToBorrowInDAI.toString())
    const daiTokenAddress = networkConfig[31337].daiTokenAddress
    await borrowDAI(daiTokenAddress, lendingPool, amountToBorrowWEI, deployer)
    await getBorrowUserData(lendingPool, deployer)

    // 3. Repay
    await repay(daiTokenAddress, amountToBorrowWEI, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)

}

async function repay(daiAddress, amount, lendingPool, account) {
    await approveERC20(daiAddress, lendingPool.target, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account)
    await repayTx.wait(1)
    console.log("Repaid!");
}

async function borrowDAI(daiAddress, lendingPool, amountToBorrowWEI, account) {
    const borrowTx =
        await lendingPool.borrow(daiAddress, amountToBorrowWEI, 2, 0, account)
    await borrowTx.wait(1)
    console.log(`You've borrowed ${amountToBorrowWEI} DAI`);
}

async function getDAIPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[31337].daiEthPriceFeed
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price}`);
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(`You have ${totalCollateralETH} worth of ETH deposited`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`);
    return { availableBorrowsETH, totalDebtETH }
}

async function approveERC20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Token Approved!!");

}

async function getLendingPool(account) {
    const LendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[31337].lendingPoolAddressesProvider,
        account
    )

    const lendingPoolAddress = await LendingPoolAddressesProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    )

    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })