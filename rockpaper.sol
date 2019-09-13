pragma solidity 0.5.11;

contract RockPaperEth {

    mapping (string => mapping(string => int)) results;
    address payable public player1;
    address payable public player2;
    uint private player1_points;
    uint private player2_points;
    string player1Hand;
    string player2Hand;
    bytes32 public player1HandHash;
    bytes32 public player2HandHash;
    uint countdownBegins;


    modifier notRegistered() { 
        /** makes sure a player is NOT already registered */
        require (msg.sender != player1 && msg.sender != player2);
        _;
    }
    modifier notNotRegistered() { 
        /** makes sure a player is already registered */
        require (msg.sender == player1 || msg.sender == player2);
        _;
    }
    
    modifier notPoor(uint amount) {
        /** ensures the player is not a peasant and has set the right amount. Currently set to 0.1 ether because games aren't for poor people */
        require (msg.value == amount);
        _;
    }

    modifier notStupid(string memory hand) {
        /** string validation for encrypt */
        require (compareStrings(hand,"0") || compareStrings(hand,"1") || compareStrings(hand,"2")|| compareStrings(hand,"3")|| compareStrings(hand,"4"));
        _;
    }
    
    constructor() public payable 
    {   
        /** constructor holding results matrix for determining winners */
        results["0"]["0"] = 0;
        results["0"]["1"] = 2;
        results["0"]["2"] = 1;
        results["0"]["3"] = 1;
        results["0"]["4"] = 2;
        results["1"]["0"] = 1;
        results["1"]["1"] = 0;
        results["1"]["2"] = 2;
        results["1"]["3"] = 2;
        results["1"]["4"] = 1;
        results["2"]["0"] = 2;
        results["2"]["1"] = 1;
        results["2"]["2"] = 0;
        results["2"]["3"] = 1;
        results["2"]["4"] = 2;
        results["3"]["0"] = 2;
        results["3"]["1"] = 1;
        results["3"]["2"] = 2;
        results["3"]["3"] = 0;
        results["3"]["4"] = 1;
        results["4"]["0"] = 1;
        results["4"]["1"] = 2;
        results["4"]["2"] = 1;
        results["4"]["3"] = 2;
        results["4"]["4"] = 0;
    }


    function register() public payable notRegistered notPoor(1 ether)  returns (bool x)
    {
        /** initial registration. first player to register is player1, second player to register is player2 */
        if (player1 == address(0))
        {
            player1 = msg.sender;
            //emit PlayerPhase(msg.sender,1);
            return true;
        }
        else if (player2 == address(0))
        {
            player2 = msg.sender;
          //  emit PlayerPhase(msg.sender,1);
            return true;
        }
        return false;
    }

    function encrypt(string memory hand, string memory random) public notNotRegistered notStupid(hand)  returns (bool x)
    {
        /** Encrypts each players initial hands */
        if (msg.sender == player1)
        {
            player1HandHash = encodeTheSecret(hand,random);
          //  emit PlayerPhase(msg.sender,2);
            return true;
        }
        else if (msg.sender == player2)
        {
            player2HandHash = encodeTheSecret(hand,random);
       //     emit PlayerPhase(msg.sender,2);
            return true;
        }
        return false;
    }

    function decrypt(string memory hand, string memory random) public notNotRegistered notStupid(hand)  returns (bool x)
    {
        /** second player is given about 5 minutes to respond after first reveal */
        if (bytes(player1Hand).length == 0 && bytes(player2Hand).length == 0)
            countdownBegins == now;

        /** stores the players hand in easy readable format if encryption and hand match */
        if (msg.sender == player1 && encodeTheSecret(hand,random) == player1HandHash)
        {
            player1Hand = hand;
          //  emit PlayerPhase(msg.sender,3);
            return true;
        }
        if (msg.sender == player2 && encodeTheSecret(hand,random) == player2HandHash)
        {
            player2Hand = hand;
            //emit PlayerPhase(msg.sender,3);
            return true;
        }
        return false;

    }

    function finish() public notNotRegistered  returns (int x)
    {
        int winner;
        if (bytes(player1Hand).length != 0 && bytes(player2Hand).length != 0) // This will trigger when both players have made a hand
        {
            winner = results[player1Hand][player2Hand];
            if (winner == 1)
                /** player 1 rocks and gets the winnings */
                player1.transfer(address(this).balance);
            else if (winner == 2)
                /** player 2 probably didn't pick scissors */
                player2.transfer(address(this).balance);
            else
            {
                /** wait, nobody won? this game is shit */
                player1.transfer(address(this).balance/2);
                player2.transfer(address(this).balance);
            }

            /** reset everything ready for the next game */
            player1Hand = "";
            player2Hand = "";
            player1HandHash = "";
            player2HandHash = "";
            player1 = address(0);
            player2 = address(0);
            countdownBegins = 0;
            return winner;
        }
        else if (now > countdownBegins + 300)
        {
            
            /** someone got hit by a bus or doesnt want to play. Whoever revealed first is the winner. */
            if (bytes(player1Hand).length != 0)
                player1.transfer(address(this).balance);
            else if (bytes(player2Hand).length != 0)
                player2.transfer(address(this).balance);

            /** reset everything ready for the next game */
            player1Hand = "";
            player2Hand = "";
            player1HandHash = "";
            player2HandHash = "";
            player1 = address(0);
            player2 = address(0);
            countdownBegins = 0;
            return winner;
        }
        else
            return -1;
    }
    
    /** Internal game functions  */
    
    function compareStrings (string memory a, string memory b) private pure returns (bool)
    {
        /** or yanno, "==" */
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function encodeTheSecret(string memory a, string memory b) private pure returns (bytes32 x)
    {
        /** super secret hashing function hashes your hand and your secret, hence making it UNHACKABLE. I mean, just look at all the brackets */
        return keccak256(abi.encodePacked(keccak256(abi.encodePacked(a)) ^ keccak256(abi.encodePacked(b))));
    }
    
}
