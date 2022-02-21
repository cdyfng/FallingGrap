/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const { task } = require("hardhat/config");

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("dotenv").config();

task("balance", "Prints an account's balance")
  //.addParam("account", "The account's address")
  .setAction(async (taskArgs) => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
      const balance = await web3.eth.getBalance(account.address);
      const token = await ethers.getContractAt("GRAPDelegator", process.env.GRAPPROXY);
      const tokenBalance = await token.balanceOf(account.address);
      console.log(account.address, web3.utils.fromWei(balance, "ether"), "ETH", tokenBalance/1e18, 'Grap');
    }
  });

  task("sendtokenamount", "Send token to an account ")
    .addParam("tokenaddress", "token address")
    .addParam("amount", "The amount to send")
    .addParam("fromindex", "The from account index")
    .addParam("toindex", "The to account index")
    .setAction(async (args) => {
      const accounts = await ethers.getSigners();
      //console.log('accounts:', accounts)
      //console.log('from:', args.fromindex)
      //console.log('to:', args.toindex)

      const from = accounts[args.fromindex].address;
      const to = accounts[args.toindex].address;

      // const token = await ethers.getContractAt("ERC20", await args.tokenaddress);
      const token = await ethers.getContractAt("GRAPDelegator", await args.tokenaddress);
      const fromBalance = await token.balanceOf(from);
      if (fromBalance.lt(0) || fromBalance.eq(0)) {
        console.log("No Balance in ", from, token.address);
        return;
      }
      const decimals = await token.decimals();
      const amount = ethers.utils.parseUnits(args.amount, decimals);

      if (fromBalance.lt(amount)) {
        console.log("No Enough Token in ", from, token.address);
        return;
      }

      console.log("from:", from);
      console.log("to:", to);
      //console.log("amount:", amount._hex);
      console.log("amount:", args.amount, amount);
      const estimate = await token.estimateGas.transfer(to, amount);
      console.log("gas estimate:", estimate);

      const transactionHash = await token
        .connect(accounts[args.fromindex])
        .transfer(to, amount, {
          //const transactionHash = await token.transfer(to, amount, {
          from: from,
          gasLimit: Math.max(estimate, 1000000),
        });
      console.log("transation:", transactionHash);
    });


    //npx hardhat --network rinkeby sendamount --fromindex 0 --toindex 3 --amount 0.001
    task("sendamount", "Send to an account with eth")
      .addParam("amount", "The amount to send")
      .addParam("fromindex", "The from account index")
      .addParam("toindex", "The to account index")
      .setAction(async (args) => {
        const accounts = await ethers.getSigners();
        //console.log('accounts:', accounts)
        //console.log('from:', args.fromindex)
        //console.log('to:', args.toindex)

        const from = accounts[args.fromindex].address;
        const to = accounts[args.toindex].address;
        const amount = ethers.utils.parseUnits(args.amount, "ether");

        console.log("from:", from);
        console.log("to:", to);
        console.log("amount:", amount._hex);
        const transactionHash = await web3.eth.sendTransaction({
          from: from,
          to: to,
          value: amount._hex, //5000000000000000, //0.005eth
          gasLimit: 21000,
          //gasPrice: 1000000000,
        });
        console.log("transation:", transactionHash);
      });



module.exports = {
  networks: {
    rinkeby: {
      // url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
      gasPrice: 10000000000, //10GWei
      gas: 2100000,
      accounts: {
        count: 10,
        mnemonic: process.env.MNEMONIC,
      },
      //accounts: [process.env.RINKEBY_PRIVKEY]
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: "0.5.17",
};
