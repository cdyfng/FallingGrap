const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const _rnd = await ethers.getContractAt("token", process.env.RND);
  console.log("RND address:", _rnd.address);

  const index = 4;
  const claim = await _rnd.connect(accounts[index]).claim();
  console.log("claiming..");
  await claim.wait();
  console.log("..", claim.hash);

  //
  const balance = await _rnd.balanceOf(accounts[index].address);
  console.log("balance: ", balance / 1e18);
  const transfer = await _rnd
    .connect(accounts[index])
    .transfer(accounts[0].address, balance);
  console.log("transfer hash: ", transfer.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
