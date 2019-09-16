const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const json = require('./../build/contracts/SPSLS.json');

let accounts;
let SPSLS;
let owner;

const interface = json['abi'];
const bytecode = json['bytecode']

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    SPSLS = await new web3.eth.Contract(interface)
              .deploy({data: bytecode})
              .send({from: owner, gas: '5000000'});
});

describe ('SPSLS', () => {
    it('deploys a contract', async () => {
        const SPSLS_owener = await SPSLS.methods.owner().call();
        assert.equal(owner, SPSLS_owener, "The house is the one who launches the smart contract.");
    });
});