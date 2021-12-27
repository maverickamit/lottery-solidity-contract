const { strictEqual, doesNotMatch } = require("assert");
const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require("../compile");

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: "1000000" });
});

describe("Lottery Contract", () => {
  it("can deploy a contract", () => {
    assert.ok(lottery.options.address);
  });

  it("allows one player to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    strictEqual(accounts[0], players[0]);
    strictEqual(1, players.length);
  });

  it("allows multiple players to enter", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei("0.02", "ether"),
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei("0.02", "ether"),
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    strictEqual(accounts[0], players[0]);
    strictEqual(accounts[1], players[1]);
    strictEqual(accounts[2], players[2]);
    strictEqual(3, players.length);
  });

  it("restricts from entering with less than minimum amount of ether", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0", "ether"),
      });
      //   If enter transaction is successful with less than minimum balance, new error is thrown.
      //   But this error object doesn't have same structure as the error object from transaction failure.
      throw new Error();
    } catch (error) {
      assert(error.results);
    }
  });

  it("restricts anyone else other than manager to access pickWinner", async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei("0.02", "ether"),
      });
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      throw new Error();
    } catch (error) {
      assert(error.results);
    }
  });

  it("sends money to the winner and resets the players array and contract balance", async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei("2", "ether"),
    });
    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({
      from: accounts[0],
    });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    //verifies money is sent to the winner
    assert(difference > web3.utils.toWei("1.8", "ether"));

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0],
    });

    //verifies players array is reset
    assert(players.length == 0);
    const contractBalance = await web3.eth.getBalance(lottery._address);

    //verifies contract balance is reset
    assert(contractBalance == 0);
  });
});
