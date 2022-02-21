const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy();
  await timelock.deployed();
  console.log("Timelock deployed to:", timelock.address);

  const GovernorAlpha = await ethers.getContractFactory("GovernorAlpha");
  const governorAlpha = await GovernorAlpha.deploy(
    timelock.address,
    process.env.GRAPPROXY
  );
  await governorAlpha.deployed();
  console.log("GovernorAlpha deployed to:", governorAlpha.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
