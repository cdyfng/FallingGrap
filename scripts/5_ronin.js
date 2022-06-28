const { ethers } = require("hardhat");
require("dotenv").config();
const { arrayify } = require("ethers/lib/utils");

const sleep = (n) => new Promise((res, rej) => setTimeout(res, n));

const ethToWei = (eth) => ethers.utils.parseEther(eth.toString());

const withdrawalERC20Hash = (withdrawalId, user, token, amount) =>
  ethers.utils.solidityKeccak256(
    ["string", "uint256", "address", "address", "uint256"],
    ["withdrawERC20", withdrawalId, user, token, amount]
  );

const sign = async (signer, data) => {
  // Ganache return the signatures directly
  const signatures = await signer.signMessage(arrayify(data));
  return `01${signatures.slice(2)}`;
};

const getCombinedSignatures = async (reversed, accounts, data) => {
  const sortedAccounts = accounts.sort((a, b) =>
    a.address.toLowerCase().localeCompare(b.address.toLowerCase())
  );

  let signatures = "";
  for (const account of sortedAccounts) {
    const signature = await sign(account, data);
    if (reversed) {
      signatures = signature + signatures;
    } else {
      signatures += signature;
    }
  }

  signatures = "0x" + signatures;

  return {
    accounts: sortedAccounts.map((account) => account.address.toLowerCase()),
    signatures,
  };
};

// let alice: SignerWithAddress;
// let bob: SignerWithAddress;
// let charles: SignerWithAddress;
// let mainchainGateway: MainchainGatewayManager;
// let registry: Registry;
// let validator: MainchainValidator;
// let mainchainGatewayProxy: MainchainGatewayProxy;
// let weth: WETH;
// let erc20: ERC20Mintable;
// let erc721: MockERC721;
let alice, bob, charles;

async function main() {
  //const accounts = await ethers.getSigners();
  [alice, bob, charles] = await ethers.getSigners();
  const MainchainGatewayManager = await ethers.getContractFactory(
    "MainchainGatewayManager"
  );
  //console.log("MainchainGatewayManager:", MainchainGatewayManager)
  let mainchainGateway = await MainchainGatewayManager.deploy();
  await mainchainGateway.deployed();
  console.log("mainchainGateway deployed to:", mainchainGateway.address);

  const WETH = await ethers.getContractFactory("WETH");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("weth deployed to:", weth.address);

  const Registry = await ethers.getContractFactory("Registry");
  const registry = await Registry.deploy();
  await registry.deployed();
  console.log("registry deployed to:", registry.address);

  const validatorStr = await registry.VALIDATOR();

  const MainchainValidator = await ethers.getContractFactory(
    "MainchainValidator"
  );
  const validator = await MainchainValidator.deploy(
    [alice.address, bob.address],
    99,
    100
  );
  console.log("validator");
  await validator.deployed();
  console.log("validator deployed to:", validator.address);

  /*const updateContract = */ await registry.updateContract(
    validatorStr,
    validator.address
  );
  // console.log("updateContract ok");
  // const receipt_updateContract = await updateContract.wait();
  // console.log("receipt_updateContract:", receipt_updateContract.transactionHash);

  const MainchainGatewayProxy = await ethers.getContractFactory(
    "MainchainGatewayProxy"
  );
  const mainchainGatewayProxy = await MainchainGatewayProxy.deploy(
    mainchainGateway.address,
    registry.address
  );

  await mainchainGatewayProxy.deployed();
  console.log(
    "mainchainGatewayProxy deployed to:",
    mainchainGatewayProxy.address
  );

  const proxiedV1 = await MainchainGatewayManager.attach(
    mainchainGatewayProxy.address
  );
  //console.log('proxiedV1:', proxiedV1)
  const wethToken = await registry.WETH_TOKEN();
  const updateContract = await registry.updateContract(wethToken, weth.address);
  console.log("updateContract", updateContract.hash);

  await registry.mapToken(weth.address, weth.address, 20);
  console.log("registry");

  console.log("alice balance:", await alice.getBalance());
  console.log("charles balance:", await charles.getBalance());
  await proxiedV1.depositEth({ value: ethToWei(9999.9) });
  console.log("depositEth:", await proxiedV1.depositCount());

  // await proxiedV1.connect(charles).depositEth({ value: ethToWei(10) })
  // console.log('depositEth:', await proxiedV1.depositCount())

  console.log("alice balance:", await alice.getBalance());
  const [owner, token, , , amount] = await proxiedV1.deposits(0);
  console.log("deposit 0:", owner, token, amount);

  // const [owner2, token2, , , amount2] = await proxiedV1.deposits(1);
  // console.log('deposit 1:', owner2, token2, amount2);

  const { signatures } = await getCombinedSignatures(
    false,
    [alice, bob],
    withdrawalERC20Hash(0, charles.address, weth.address, ethToWei(9999))
  );
  console.log("withdraw..ing with signatues:", signatures);

  await proxiedV1
    .connect(charles)
    .withdrawToken(0, weth.address, ethToWei(9999), signatures);
  console.log("charles balance:", await charles.getBalance());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
