const { ethers } = require("hardhat");

async function main() {
  const GRAPImplementation = await ethers.getContractFactory("GRAPDelegate");
  const grapImplementation = await GRAPImplementation.deploy();
  await grapImplementation.deployed();
  console.log("GRAPImplementation deployed to:", grapImplementation.address);
  const GRAPProxy = await ethers.getContractFactory("GRAPDelegator");
  const grapProxy = await GRAPProxy.deploy(
    "GRAP",
    "GRAP",
    18,
    "2000000000000000000000000",
    grapImplementation.address,
    "0x"
  );
  await grapProxy.deployed();
  console.log("GRAPProxy deployed to:", grapProxy.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
