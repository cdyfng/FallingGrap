const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const getXEN = await ethers.getContractAt("GETXEN", process.env.GETXEN);
  console.log("GETXEN address:", getXEN.address);

  const batchClaim = await getXEN.connect(accounts[1]).claimRank(10, 1);
  console.log("claiming..", batchClaim.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
