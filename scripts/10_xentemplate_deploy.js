const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const Batcher = await ethers.getContractFactory("Batcher");
  const batcher = await Batcher.deploy(30);
  console.log("Batcher deployed to:", batcher.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
