pragma solidity 0.5.11;

contract SPSLS {
    function () external payable
    {
        
    }
    mapping (string => mapping(string => int)) results;
    address payable public player1;
    address payable public player2;
    address payable public owner;
    address payable public house;
    uint public player1_points;
    uint public player2_points;
    string public player1Hand;
    string public player2Hand;
    bytes32 public player1HandHash;
    bytes32 public player2HandHash;
    uint private MAX_ROUND;
    uint private bidAmount = 1 ether;
    uint public round_no;
    int8 public gametype;
    int8 public whowithdrew;
    int winner = -1;
    string public getFinalResult = "";
    uint256 constant UINT256_MAX = ~uint256(0) - 1000000;
    uint private TIMEOUTTIMER = 10;
    uint public countdownBegins=UINT256_MAX;
    
    
    constructor() public payable 
    {   
        
        owner= msg.sender;
        house = address(this);
        gametype=0;
        whowithdrew=0;
        MAX_ROUND = 3;
        round_no = 0;
        
        player1_points = 0;
        player2_points = 0;
        
        player1 = address(0);
        player2 = address(0);
        
        player1Hand = "";
        player2Hand = "";
        player1HandHash = 0;
        player2HandHash = 0;
        
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
    
    
    
    /* Validation Modifiers */
    modifier isRegistered() { 
        /** makes sure a player is already registered */
        require (msg.sender == player1 || msg.sender == player2,"join first!");
        _;
    }

    modifier isValid(string memory hand) {
        /** string validation for encrypt */
        require (compareStrings(hand,"0") || compareStrings(hand,"1") || compareStrings(hand,"2")|| compareStrings(hand,"3")|| compareStrings(hand,"4"));
        _;
    }
    
    
    
    
    
    
    
    /* utily functions */
    function compareStrings (string memory a, string memory b) private pure returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function calcHash(string memory a, string memory b) private pure returns (bytes32 x)
    {
        return keccak256(abi.encodePacked(a,b));
    }
    
    function random(uint _range) private view returns (string memory) 
    {
        uint randomnumber = uint(keccak256(abi.encodePacked(now, msg.sender, block.timestamp, block.difficulty))) % _range;
        if(randomnumber==0) return "0";
        if(randomnumber==1) return "1";
        if(randomnumber==2) return "2";
        if(randomnumber==3) return "3";
        if(randomnumber==4) return "4";
    }

    function donateToHouse() public payable
    {
        house.transfer(msg.value); 
    }
    
    function etherInHouse() public view returns(uint)
    {
        return house.balance;
    }
    
    function withdraw() public isRegistered 
    {
         if (msg.sender==player1)
                player2.transfer(2*bidAmount);
            else if (msg.sender==player2)
                player1.transfer(2*bidAmount);

            /** reset everything ready for the next game */
            player1Hand = "";
            player2Hand = "";
            player1HandHash = "";
            player2HandHash = "";
            player1_points=0;
            player2_points=0;
            player1 = address(0);
            player2 = address(0);
            round_no = 0;
            gametype=0;
            whowithdrew = 0;
            countdownBegins=UINT256_MAX;
    }
    
    function countdown() private
    {
        if (whowithdrew == 1)
            player2.transfer(2*bidAmount);
        else if (whowithdrew == 2)
            player1.transfer(2*bidAmount);
        player1Hand = "";
        player2Hand = "";
        player1HandHash = "";
        player2HandHash = "";
        player1_points=0;
        player2_points=0;
        player1 = address(0);
        player2 = address(0);
        round_no = 0;
        gametype=0;
        whowithdrew = 0;
        countdownBegins=UINT256_MAX;
    }
 
    
    
    
    
    
    /* Main functions*/
    function PlayWithBot() external payable
    {
        require(gametype != 1, "Room not free");
        
        require(player1 == address(0), "Players limit reached.");
        
        require (msg.value == bidAmount,"bid 1 ether");
    
        require(address(this).balance >= 2 ether, "House is empty. Donate ethers to  house");
    
        winner = -1;    
        getFinalResult = "";
        
        if(player1 == address(0))
        {
            player1 = msg.sender;
            player2 = house;
        }
        gametype = -1;
    }
    
    function PlayWithPlayer() public payable
    {
        /** initial registration. first player to register is player1, second player to register is player2 */
        require(gametype != -1, "Room not free");

        require (msg.sender != player1 && msg.sender != player2,"You can't play as both players");
        
        require(player1 == address(0) || player2 == address(0), "Players limit reached.");
        
        require (msg.value == bidAmount,"bid 1 ether");
    
        gametype = 1;
        winner = -1;    
        getFinalResult = "";
        
        if (player1 == address(0))
        {
            player1 = msg.sender;
        }
        else if (player2 == address(0))
        {
            player2 = msg.sender;
        }
    }

    function commit(bytes32 _hash) public payable isRegistered 
    {
        /** Encrypts each players initial hands */
        require(gametype == 1, "Commit only if you play with player");
        
        if (msg.sender == player1)
        {
            require(player1HandHash == 0,"Cannot commit twice"); 
            player1HandHash = _hash;
        }
        else if (msg.sender == player2)
        {
            require(player2HandHash == 0,"Cannot commit twice");
            player2HandHash = _hash; 
        }
    }

    function reveal(string memory _hand, string memory _nonce) public isRegistered isValid(_hand)
    {
        
        if(gametype != -1)
            require(player1HandHash != 0 && player2HandHash != 0, "Commit before you reveal OR Let the other player commit");
        

         if (bytes(player1Hand).length == 0 && bytes(player2Hand).length == 0)
         {
            countdownBegins = now;
            if(msg.sender == player2)
                whowithdrew=1;
            else
                whowithdrew=2;
         }
        if (msg.sender == player1)
        {
            if(gametype != -1)
                require( calcHash(_hand,_nonce) == player1HandHash, "Commit violation");
            
            player1Hand = _hand;
                
            if(gametype == -1)
                player2Hand = random(5);
        }
        if (msg.sender == player2)
        {
            if(gametype != -1)
                require( calcHash(_hand,_nonce) == player2HandHash, "Commit violation");
            
            player2Hand = _hand;
        }
    }

    
    function roundResult() public  isRegistered
    {
        winner = -1;
        require(round_no < MAX_ROUND);
        if (now > countdownBegins + TIMEOUTTIMER)
        {
            countdown();
            return;
        }
        require(bytes(player1Hand).length != 0 && bytes(player2Hand).length != 0, "Both players haven't played."); // This will trigger when both players have made a hand
       
        round_no++;
        winner = results[player1Hand][player2Hand];
        if (winner == 1)
            player1_points++;
        else if (winner == 2)
            player2_points++;

        player1Hand = "";
        player2Hand = "";
        player1HandHash = 0;
        player2HandHash = 0;
        
        if(round_no == MAX_ROUND)
        {
            if (player1_points == player2_points) 
            {
                owner.transfer(2*bidAmount); 
                getFinalResult = "Draw";
            }
            else if (player1_points > player2_points) 
            {
                player1.transfer(2*bidAmount);
                getFinalResult = "Player1 wins";
            }
            else if (player1_points < player2_points) 
            {
                if(gametype == 1)
                    player2.transfer(2*bidAmount);
                getFinalResult = "Player2 wins";
            }
  
            player1_points=0;
            player2_points=0;
            player1 = address(0);
            player2 = address(0);
            round_no = 0;
            gametype=0;
        }
        countdownBegins=UINT256_MAX;
        whowithdrew = 0;

    }
    
    function getRoundResult() public view returns(string memory)
    {
        if(winner == 0)
        {
            return "DRAW";
        }
        if(msg.sender == player1)
        {
            if(winner == 1)
            {
                return "YOU WIN";   
            }
            else
            {
                return "YOU LOSE";
            }
        }
        if(msg.sender == player2)
        {
            if(winner == 2)
            {
                return "YOU WIN";   
            }
            else
            {
                return "YOU LOSE";
            }
        }
        return "NOT YET PLAYED";
    }
    
}