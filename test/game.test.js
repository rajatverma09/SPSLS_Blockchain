const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const json = require('./../build/contracts/SPSLS.json');

let accounts;
let SPSLS;
let owner;
let hash_1rajat = "0xf198094f3f059c62f93aea0a2ff0d60260eb090a38cd9b863ae19d52cbaa999d";
let hash_2rajat = "0x742d7499fdb7a04e4fc4f20895e6f047a2f875a51992b966adc6e7d50e432a99";
let hash_2megha = "0xc2d4cd0652247eab06a4389d53069ac545b1e8638af5e1b1923f38e457a30e65";
let hash_3megha = "0xad74bfef18398fe29bfaa95b63e5aa3793ef504468048ad495b7d45beb5f5156";

const ETHER = 10**18;

const interface = json['abi'];
const bytecode = json['bytecode']

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    owner = accounts[0];
    SPSLS = await new web3.eth.Contract(interface)
              .deploy({data: bytecode})
              .send({from: owner, gas: '5000000'});
});



describe ('SPSLS', () => {
    
    it('check if owner is deployer of contract', async () => {
        const SPSLS_owener = await SPSLS.methods.owner().call();
        assert.equal(owner, SPSLS_owener, "The Owener is the one who Deployed the smart contract.");
    });

    it('Check house receives ether', async () => {

        await SPSLS.methods.donateToHouse().send({ from: accounts[5], value: 10 * ETHER, gas: 3000000});
        assert(await SPSLS.methods.etherInHouse().call() >= 10 * ETHER, "House didn't receive ether");
    });


    it("Play with Player registration check", async () => {
        //checks registration returns true for both accounts
        assert.ok(await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000}), "Registration failed by player 1");
        assert.ok(await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000}), "Registration failed by player 2");
    });

    it("Play with Bot registration check", async () => {
        //checks registration returns true for both accounts
         await SPSLS.methods.donateToHouse().send({ from: accounts[5], value: 1 * ETHER, gas: 3000000});

        assert.ok(await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000}), "Registration failed player 1 for bot");
    });

    it('doesn\'t allow same address for both registrations', async () => {
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");
    });

    it('More than 2 players can\'t join in Player to player', async () => {
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[3], value: 1 * ETHER, gas: 3000000});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });

    it('More than 1 players can\'t join with Bot', async () => {
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.donateToHouse().send({ from: accounts[5], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithBot().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });

    it("only allows 1 eth to be sent For registration", async () => {
        //makes sure value is set at 0.1 eth
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 11 * ETHER, gas: 3000000});
        }  
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

        exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 11 * ETHER, gas: 3000000});
        }  
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");
    });

    it('You can\'t play with player and bot simultaniously', async () => {
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.donateToHouse().send({ from: accounts[5], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    }); 

     
    it('You can\'t play if House has no ETH', async () => {
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });     

    it('No commitment needed with bot', async () => {
        var exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.donateToHouse().send({ from: accounts[5], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
            await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });     

    it('Cannot change commit hash', async () => {
        var exceptionOccurred = false;
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        try 
        {
            await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1]});
            await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

        exceptionOccurred = false;
        try 
        {
            await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2]});
            await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });


    it('Can\'t commit before reveal', async () => {
        var exceptionOccurred = false;
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        try 
        {
            await SPSLS.methods.reveal("1","rajat").send({from: accounts[1]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });

    it('Can\'t revel until both players commit', async () => {
        var exceptionOccurred = false;
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1]});

        try 
        {
            await SPSLS.methods.reveal("1","rajat").send({from: accounts[1]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");

    });
    

    it('Commit and reveal mismatch', async () => {
        var exceptionOccurred = false;
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1]});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2]});

        try 
        {
            await SPSLS.methods.reveal("1","xyz").send({from: accounts[1]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");
    });
    
    it('Can\'t get result unless commit and reveal is done by both players', async () => {
        var exceptionOccurred = false;
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});

        try 
        {
            await SPSLS.methods.roundResult().send({from: accounts[1]});
        }
        catch (error) 
        {
            exceptionOccurred = true;
            console.log("         ERR:" + error.message);
            assert(error.message.startsWith("VM Exception while processing transaction:"),'Expected revert!');
        }
        assert(exceptionOccurred, "Invalid test case.");
    });


    it('Commit and reveal', async () => {

        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});

        assert.ok(await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000}));
        assert.ok(await SPSLS.methods.commit(hash_2megha).send({from: accounts[2], gas: 3000000}));
        assert.ok(await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000}));
        assert.ok(await SPSLS.methods.reveal("2","megha").send({from: accounts[2], gas: 3000000}));

    });

    it('Play with player GAME Player1 wins', async () => {

        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});

        await SPSLS.methods.commit(hash_2megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[1], gas: 3000000});  
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);


        await SPSLS.methods.commit(hash_3megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.commit(hash_3megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_2rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("2","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        let final = await SPSLS.methods.getFinalResult().call();
        // console.log("ERR: " + final);
        assert.equal(final,"Player1 wins","Wrong Answer!");
    });

    it('Play with player GAME Player2 wins', async () => {

        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});

        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_2megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[2], gas: 3000000});  
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);


        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.commit(hash_2rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        let final = await SPSLS.methods.getFinalResult().call();
        // console.log("ERR: " + final);
        assert.equal(final,"Player2 wins","Wrong Answer!");
    });


    it('Play with player GAME Draw', async () => {

        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});

        await SPSLS.methods.commit(hash_2megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[1], gas: 3000000});  
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);
        
        
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.commit(hash_2megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_2rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("2","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        let final = await SPSLS.methods.getFinalResult().call();
        // console.log("ERR: " + final);
        assert.equal(final,"Draw","Wrong Answer!");
    });
    

    it('Play with Bot GAME', async () => {

        let round_winner;

        await SPSLS.methods.donateToHouse().send({ from: accounts[5], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithBot().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});

        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});
        // console.log("RES: " + round_winner);

        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        let final = await SPSLS.methods.getFinalResult().call({from: accounts[1], gas: 3000000});
        // console.log("ERR: " + final);
        assert(final == "Player1 wins" || final == "Player2 wins" || final == "Draw" , "Wrong Answer!");
    });


    it('Check varibles are reset at the end of the game', async () => {

        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});

        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_2megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[2], gas: 3000000});  
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);


        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.commit(hash_2rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        let final = await SPSLS.methods.getFinalResult().call();
        // console.log("ERR: " + final);
        assert.equal(final,"Player2 wins","Wrong Answer!");

        assert.equal(await SPSLS.methods.player1().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1Hand().call(), "", "Variable not reset");
        assert.equal(await SPSLS.methods.player2Hand().call(), "", "Variable not reset");

        assert.equal(await SPSLS.methods.player1HandHash().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2HandHash().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1_points().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2_points().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.gametype().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.round_no().call(), 0, "Variable not reset");
    });


    it('Check Ethers are transfered to winner', async () => {

        
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        
        let initial_bal = await SPSLS.methods.etherInHouse().call();

        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_2megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[2], gas: 3000000});  
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);


        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.commit(hash_2rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
        
        
        let final = await SPSLS.methods.getFinalResult().call();
        // console.log("ERR: " + final);
        assert.equal(final,"Player2 wins","Wrong Answer!");
        
        let new_balance = await SPSLS.methods.etherInHouse().call();
        assert.ok(new_balance == (initial_bal - (2* ETHER)));
    });

    it('Check Withdraw function', async () => {
        
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        
        let initial_bal = await SPSLS.methods.etherInHouse().call();

        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_2megha).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[2], gas: 3000000});  
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);

        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_3megha).send({from: accounts[2], gas: 3000000});

        await SPSLS.methods.withdraw().send({ from: accounts[1], gas: 3000000});
        
        assert.equal(await SPSLS.methods.player1().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1Hand().call(), "", "Variable not reset");
        assert.equal(await SPSLS.methods.player2Hand().call(), "", "Variable not reset");

        assert.equal(await SPSLS.methods.player1HandHash().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2HandHash().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1_points().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2_points().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.gametype().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.round_no().call(), 0, "Variable not reset");

        let new_balance = await SPSLS.methods.etherInHouse().call();
        assert.ok(new_balance == (initial_bal - (2* ETHER)));
    });

    it('Check Withdraw function just after register', async () => {
        
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        
        let initial_bal = await SPSLS.methods.etherInHouse().call();

        await SPSLS.methods.withdraw().send({ from: accounts[1], gas: 3000000});
        
        assert.equal(await SPSLS.methods.player1().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1Hand().call(), "", "Variable not reset");
        assert.equal(await SPSLS.methods.player2Hand().call(), "", "Variable not reset");

        assert.equal(await SPSLS.methods.player1HandHash().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2HandHash().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1_points().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2_points().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.gametype().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.round_no().call(), 0, "Variable not reset");

        let new_balance = await SPSLS.methods.etherInHouse().call();
        assert.ok(new_balance == (initial_bal - (2* ETHER)));
    });


    it('Check Timeout timer after only first player has revealed', async function() {
        
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        
        let initial_bal = await SPSLS.methods.etherInHouse().call();

        await SPSLS.methods.commit(hash_2megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[1], gas: 3000000});  
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);


        await SPSLS.methods.commit(hash_3megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[1], gas: 3000000});
        console.log("            Timer running");
        await sleep(13000);

        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        
        assert.equal(await SPSLS.methods.player1().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1Hand().call(), "", "Variable not reset");
        assert.equal(await SPSLS.methods.player2Hand().call(), "", "Variable not reset");

        assert.equal(await SPSLS.methods.player1HandHash().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2HandHash().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1_points().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2_points().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.gametype().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.round_no().call(), 0, "Variable not reset");

        let new_balance = await SPSLS.methods.etherInHouse().call();
        assert.ok(new_balance == (initial_bal - (2* ETHER)));

    }).timeout(40000);


    it('Check Timeout timer after both players have revealed but did not check result', async function() {
        
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[1], value: 1 * ETHER, gas: 3000000});
        await SPSLS.methods.PlayWithPlayer().send({ from: accounts[2], value: 1 * ETHER, gas: 3000000});
        
        let initial_bal = await SPSLS.methods.etherInHouse().call();

        await SPSLS.methods.commit(hash_2megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("2","megha").send({from: accounts[1], gas: 3000000});  
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});
                
        // round_winner = await SPSLS.methods.getRoundResult().call({from: accounts[1], gas: 3000000});        
        // console.log("RES: " + round_winner);


        await SPSLS.methods.commit(hash_3megha).send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.commit(hash_1rajat).send({from: accounts[2], gas: 3000000});
        await SPSLS.methods.reveal("3","megha").send({from: accounts[1], gas: 3000000});
        await SPSLS.methods.reveal("1","rajat").send({from: accounts[2], gas: 3000000});
        
        console.log("            Timer running");
        await sleep(13000);

        await SPSLS.methods.roundResult().send({from: accounts[1], gas: 3000000});

        
        assert.equal(await SPSLS.methods.player1().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1Hand().call(), "", "Variable not reset");
        assert.equal(await SPSLS.methods.player2Hand().call(), "", "Variable not reset");

        assert.equal(await SPSLS.methods.player1HandHash().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2HandHash().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.player1_points().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.player2_points().call(), 0, "Variable not reset");

        assert.equal(await SPSLS.methods.gametype().call(), 0, "Variable not reset");
        assert.equal(await SPSLS.methods.round_no().call(), 0, "Variable not reset");

        let new_balance = await SPSLS.methods.etherInHouse().call();
        assert.ok(new_balance == (initial_bal - (2* ETHER)));

    }).timeout(40000);



});


