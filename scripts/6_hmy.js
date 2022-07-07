const { ethers } = require("hardhat");
require("dotenv").config();
const keccak256 = require("keccak256");
let alice, bob, charles;

// npm i @openzeppelin/contract
async function main() {
  //const accounts = await ethers.getSigners();
  [alice, bob, charles] = await ethers.getSigners();
  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
  //console.log("MainchainGatewayManager:", MainchainGatewayManager)
  let multiSigWallet = await MultiSigWallet.deploy(
    [alice.address, bob.address, charles.address],
    2
  );
  await multiSigWallet.deployed();
  console.log("multiSigWallet deployed to:", multiSigWallet.address);

  const ERC20EthManager = await ethers.getContractFactory("ERC20EthManager");
  const erc20EthManager = await ERC20EthManager.deploy(multiSigWallet.address);
  await erc20EthManager.deployed();
  console.log("ERC20EthManager deployed to:", erc20EthManager.address);

  const MyERC20 = await ethers.getContractFactory("MyERC20");
  const myERC20 = await MyERC20.deploy("MYERC20", "MY20", 18);
  await myERC20.deployed();
  console.log("myERC20 deployed to:", myERC20.address);

  await myERC20.mint(
    charles.address,
    ethers.BigNumber.from("10000000000000000000000000")
  );
  console.log(
    "charles balance:",
    (await myERC20.balanceOf(charles.address)) / 1e18
  );

  await myERC20
    .connect(charles)
    .approve(
      erc20EthManager.address,
      ethers.BigNumber.from("5000000000000000000000000")
    );
  const lockToken = await erc20EthManager
    .connect(charles)
    .lockToken(
      myERC20.address,
      ethers.BigNumber.from("5000000000000000000000000"),
      charles.address
    );
  console.log(
    "erc20EthManager balance:",
    (await myERC20.balanceOf(erc20EthManager.address)) / 1e18
  );

  //const unlockToken = await erc20EthManager.connect(charles).unlockToken(myERC20.address, ethers.BigNumber.from("5000000000000000000000000"), charles.address, '0x241A1FF1DBBA0CEE3FB9FD99B37D93D8005A0725FE4FA3D7CA79D39BA14022D5')

  const abiCoder = new ethers.utils.AbiCoder();
  const data = abiCoder.encode(
    ["address", "uint256", "address", "bytes32"],
    [
      myERC20.address,
      "5000000000000000000000000",
      charles.address,
      "0x241A1FF1DBBA0CEE3FB9FD99B37D93D8005A0725FE4FA3D7CA79D39BA14022D5",
    ]
  );
  console.log("data:", data);
  console.log("data:", data.slice(2));
  const data2 =
    "0x" +
    keccak256("unlockToken(address,uint256,address,bytes32)")
      .toString("hex")
      .slice(0, 8) +
    data.slice(2);
  console.log("data2:", data2);
  let unlockToken = await multiSigWallet
    .connect(alice)
    .submitTransaction(erc20EthManager.address, 0, data2);
  console.log("unlock hash1:", unlockToken.hash);
  // let result = await unlockToken.wait();
  // console.log('r1:', result)

  const transactionCount = await multiSigWallet.transactionCount();
  console.log("transactionCount:", transactionCount);

  console.log(
    "charles balance:",
    (await myERC20.balanceOf(charles.address)) / 1e18
  );
  let confirmTransaction2 = await multiSigWallet
    .connect(bob)
    .confirmTransaction(transactionCount - 1);
  console.log("unlock hash2:", confirmTransaction2.hash);
  console.log(
    "charles balance:",
    (await myERC20.balanceOf(charles.address)) / 1e18
  );
  // result = await confirmTransaction2.wait();
  // console.log('r2:', result)

  console.log(
    "erc20EthManager balance:",
    (await myERC20.balanceOf(erc20EthManager.address)) / 1e18
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
