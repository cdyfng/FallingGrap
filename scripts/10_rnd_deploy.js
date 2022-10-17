const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const token = await ethers.getContractFactory("token");
  const _token = await token.deploy();
  console.log("token deployed to:", _token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
