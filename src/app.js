const ETHER = 10 ** 18;

App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const spsls = await $.getJSON('SPSLS.json')
    App.contracts.Spsls = TruffleContract(spsls)
    App.contracts.Spsls.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.spsls = await App.contracts.Spsls.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }
    // Update app loading state
    App.setLoading(true)

    // Update loading state
    App.setLoading(false)
  },

  convertToResult: async (id) => {
    if (id == 0)
      return "Rock";
    if (id == 1)
      return "Papper";
    if (id == 2)
      return "Scissors";
    if (id == 3)
      return "Lizard";
    if (id == 4)
      return "Spock";

  },

  updateStatus: async () => {
    const state = await App.spsls.getState();
    if (state == 0)
      document.getElementById("state").innerHTML = "Player1 revealed " + await App.convertToResult(await App.spsls.player1Hand()) + " Player2 revealed " + await App.convertToResult(await App.spsls.player2Hand());
    if (state == 1)
      document.getElementById("state").innerHTML = "Player1 revealed " + await App.convertToResult(await App.spsls.player1Hand());
    if (state == 2)
      document.getElementById("state").innerHTML = "Player2 revealed " + await App.convertToResult(await App.spsls.player2Hand());
    if (state == 3)
      document.getElementById("state").innerHTML = "Nobody commited";
    if (state == 4)
      document.getElementById("state").innerHTML = "Player1 commited";
    if (state == 5)
      document.getElementById("state").innerHTML = "Player2 commited";
    if (state == 6)
      document.getElementById("state").innerHTML = "Both players commited";
    return state;
  },

  updateGame: async () => {
    // console.log(await App.spsls.countdownBegins())
    // Render Account
    $('#account').html(App.account)

    var registered = await App.isRagistered()
    console.log("Register: " + registered)

    // Switch on/off section 1
    if (document.getElementById("section1").style.display == "none")
      if (!registered)
        document.getElementById("section1").style.display = "block";
    if (document.getElementById("section1").style.display == "block")
      if (registered)
        document.getElementById("section1").style.display = "none";

    // Switch on/off withdraw 
    if (document.getElementById("withdraw").style.display == "none")
      if (registered)
        document.getElementById("withdraw").style.display = "block";
    if (document.getElementById("withdraw").style.display == "block")
      if (!registered)
        document.getElementById("withdraw").style.display = "none";

    // Switch on/off roundno
    if (registered) {
      document.getElementById("roundno").innerHTML = "Round No. " + await App.spsls.round_no();
      document.getElementById("roundno").style.display = "block";
    }
    if (document.getElementById("roundno").style.display == "block")
      if (!registered)
        document.getElementById("roundno").style.display = "none";

    var state = await App.updateStatus()

    // Switch on/off section 2
    if (document.getElementById("section2").style.display == "none")
      if (registered && (state == 3 || state == 4 || state == 5))
        document.getElementById("section2").style.display = "block";
    if (document.getElementById("section2").style.display == "block")
      if (!(registered && (state == 3 || state == 4 || state == 5)))
        document.getElementById("section2").style.display = "none";

    // Switch on/off section 3
    if (document.getElementById("section3").style.display == "none")
      if (registered && (state == 1 || state == 2 || state == 6))
        document.getElementById("section3").style.display = "block";
    if (document.getElementById("section3").style.display == "block")
      if (!(registered && (state == 1 || state == 2 || state == 6)))
        document.getElementById("section3").style.display = "none";

    // Switch on/off section 4
    if (document.getElementById("section4").style.display == "none")
      if (state == 0)
        document.getElementById("section4").style.display = "block";
    if (document.getElementById("section4").style.display == "block")
      if (state != 0)
        document.getElementById("section4").style.display = "none";

  },

  isRagistered: async function () {
    if (App.account == await App.spsls.player1())
      return 1;
    if (App.account == await App.spsls.player2())
      return 2;
    return 0;
  },



  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  },

  donateToHouse: async () => {
    App.setLoading(true)
    const val = $('#_donate').val()
    await App.spsls.donateToHouse({ from: App.account, value: val * ETHER })
    App.setLoading(false)
  },

  PlayWithBot: async () => {
    App.setLoading(true)
    await App.spsls.PlayWithBot({ from: App.account, value: 1 * ETHER })
    App.setLoading(false)
  },

  PlayWithPlayer: async () => {
    App.setLoading(true)
    await App.spsls.PlayWithPlayer({ from: App.account, value: 1 * ETHER })
    App.setLoading(false)
  },

  commit: async () => {
    App.setLoading(true)
    var e = document.getElementById("choice");
    var choice = e.options[e.selectedIndex].value;
    _nonce = document.getElementById("_Cnonce").value;
    console.log("commit :: " + choice + _nonce)
    var hash = await App.spsls.calcHash(choice, _nonce)
    console.log(hash)
    await App.spsls.commit(hash, { from: App.account })
    App.setLoading(false)

  },

  reveal: async () => {
    App.setLoading(true)
    var e = document.getElementById("choice");
    var choice = e.options[e.selectedIndex].value;
    _nonce = document.getElementById("_Rnonce").value;
    await App.spsls.reveal(choice, _nonce, { from: App.account })
    App.setLoading(false)
  },

  roundResult: async () => {
    App.setLoading(true)
    var result = await App.spsls.roundResult({ from: App.account })
    document.getElementById("state").innerHTML = result;
    App.setLoading(false)
  },

  withdraw: async () => {
    App.setLoading(true)
    await App.spsls.withdraw({ from: App.account })
    App.setLoading(false)
  },

}

$(() => {
  $(window).load(() => {
    App.load();
    setInterval(function () {
      App.loadAccount();
      App.updateGame();
    }, 2000);
  });
});
