const { ethers } = require("hardhat");

async function main() {
  const accounts = await ethers.getSigners();

  // const batcherABI = [
  //   "function execute(address, bytes) payable",
  //   "function withdraw(address)",
  //   "function withdrawETH(address)",
  //   "function destroy()",
  // ]

  const xenCrypto = await ethers.getContractAt(
    "XENCrypto",
    process.env.XENCRYPTO
  );
  console.log("XENCrypto address:", xenCrypto.address);

  const batcher = await ethers.getContractAt(
    "contracts/XEN/XENTemplate.sol:Proxy",
    process.env.BATCHER
  );
  console.log("Batcher address:", batcher.address);

  let tx = await batcher.execute(
    xenCrypto.address,
    xenCrypto.interface.encodeFunctionData("claimRank", [1])
  );
  await tx.wait();
  console.log("execute..", tx.hash);

  console.log(
    "XEN balance: ",
    (await xenCrypto.balanceOf(accounts[0].address)).toString()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
