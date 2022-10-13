const { ethers } = require("hardhat");
require("dotenv").config();
const sleep = (n) => new Promise((res, rej) => setTimeout(res, n));

async function main() {
  const accounts = await ethers.getSigners();

  const xENCrypto = await ethers.getContractAt(
    "XENCrypto",
    process.env.XENCRYPTO
  );
  console.log("XENCrypto deployed to:", xENCrypto.address);

  for (const index in accounts) {
    // let index = 1
    //check gas
    const balance = await web3.eth.getBalance(accounts[index].address);
    if (web3.utils.fromWei(balance, "ether") > 0.001) {
      console.log("Enogth Gas for", accounts[index].address);
    } else {
      const transactionHash = await web3.eth.sendTransaction({
        from: accounts[0].address,
        to: accounts[index].address,
        value: ethers.utils.parseUnits("0.01", "ether")._hex, //5000000000000000, //0.005eth
        gasLimit: 21000,
        //gasPrice: 1000000000,
      });
      console.log(
        "send 0.1eth from ",
        accounts[0].address,
        "to",
        accounts[index].address,
        transactionHash
      );
    }
    //check if already MINT
    const userMint = await xENCrypto.connect(accounts[index]).getUserMint();
    console.log(accounts[index].address, "userRank:", userMint[3].toNumber());
    if (userMint[3].toNumber() != 0) {
      console.log(accounts[index].address, "already claimed");
    } else {
      //mint
      const claim = await xENCrypto.connect(accounts[index]).claimRank(1);
      console.log("claiming..", claim.hash);
    }
  }

  //continue
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
