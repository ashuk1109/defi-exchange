const { ethers } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")

const AMOUNT = ethers.parseEther("0.02")

async function getWeth() {
    const accounts = await ethers.getSigners()
    const deployer = accounts[0]
    const iweth = await ethers.getContractAt(
        "IWeth",
        networkConfig[31337].wethTokenAddress,
        deployer
    )

    const tx = await iweth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iweth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`);

}

module.exports = { getWeth, AMOUNT }