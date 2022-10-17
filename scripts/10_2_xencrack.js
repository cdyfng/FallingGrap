const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const GETXEN = await ethers.getContractFactory("GETXEN");
  const getXEN = await GETXEN.deploy();
  console.log("GETXEN deployed to:", getXEN.address);

  const batchClaim = await getXEN.connect(accounts[1]).claimRank(100, 1);
  console.log("claiming..", batchClaim.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
