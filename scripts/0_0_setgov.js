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

  // console.log('setting gov of grapDelegator: ', timelock.address);
  // console.log('grap pending gov: ', await grapDelegator.pendingGov());
  // console.log('grap  gov: ', await grapDelegator.gov());

  //1. set gov of grapDelegator with timelock.addresses
  // const settingPendingGov = await grapDelegator._setPendingGov(timelock.address);
  // console.log('settingPendingGov: ', settingPendingGov);
  // console.log('waiting 60s');
  // await sleep(60000)
  // console.log('grap pending gov: ', await grapDelegator.pendingGov());

  //2. timelock executeTransaction _acceptGov()
  // const abiCoder = new ethers.utils.AbiCoder();
  // const target = grapDelegator.address;
  // const value = 0;
  // const signature = "_acceptGov()";
  //
  // const calldata = "0x";//new bytes(0); //try "0x". later
  // const eta = 0;
  //
  // console.log("targets:", target);
  // console.log("values:", value);
  // console.log("calldatas:", calldata);
  // const tn = await timelock.executeTransaction(target, value, signature, calldata, eta);
  // console.log(tn)
  //
  // console.log('waiting 60s');
  // await sleep(60000)
  // console.log('grap pending gov: ', await grapDelegator.pendingGov());
  // console.log('grap  gov: ', await grapDelegator.gov());

  //3.
  let admin = await timelock.admin();
  console.log("admin:", admin);
  let pendingAdmin = await timelock.pendingAdmin();
  console.log("pendingAdmin:", pendingAdmin);
  const admin_initialized = await timelock.admin_initialized();
  console.log("admin_initialized:", admin_initialized);

  const tx_setPednigAdmin = await timelock.setPendingAdmin(
    governorAlpha.address
  );
  console.log("tx_setPednigAdmin:", tx_setPednigAdmin);

  console.log("waiting 30s");
  await sleep(30000);
  const acceptAdmin = await governorAlpha.__acceptAdmin();
  console.log("acceptAdmin:", acceptAdmin);

  console.log("waiting 30s");
  await sleep(30000);
  admin = await timelock.admin();
  console.log("admin:", admin);
  pendingAdmin = await timelock.pendingAdmin();
  console.log("pendingAdmin:", pendingAdmin);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
