const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  const _rnd = await ethers.getContractAt("token", process.env.RND);
  console.log("RND address:", _rnd.address);

  const batcher = await ethers.getContractAt(
    "contracts/XEN/XENTemplate.sol:Proxy",
    process.env.BATCHER
  );
  console.log("Batcher address:", batcher.address);

  let tx = await batcher.execute(
    _rnd.address,
    _rnd.interface.encodeFunctionData("claim", [])
  );
  await tx.wait();
  console.log("execute..claim", tx.hash);

  tx = await batcher.withdraw(_rnd.address);
  await tx.wait();
  console.log("execute..withdraw", tx.hash);

  console.log(
    "RND balance: ",
    (await _rnd.balanceOf(accounts[0].address)).toString()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
