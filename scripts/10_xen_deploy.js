const { ethers } = require("hardhat");

async function main() {
  const Math = await ethers.getContractFactory("Math");
  const math = await Math.deploy();

  const XENCrypto = await ethers.getContractFactory("XENCrypto", {
    libraries: {
      Math: math.address,
    },
  });
  const xENCrypto = await XENCrypto.deploy();
  await xENCrypto.deployed();
  console.log("XENCrypto deployed to:", xENCrypto.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
