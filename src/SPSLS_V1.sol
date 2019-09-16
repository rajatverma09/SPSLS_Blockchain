pragma solidity ^0.5.11;

contract RockPaperScissors {
    address payable private player1;
    address payable private player2;
    address payable private owner;
    uint private player1_points;
    uint private player2_points;
    uint private choiceOfPlayer1;
    uint private choiceOfPlayer2;
    int8 is_player_to_player;
    uint private MAX_ROUND;
    uint private round_no;
    uint private BID_AMOUNT;
    int[5][5] private winner;
    
    constructor() public {
        owner= msg.sender;
        player1 = address(0);
        player2 = address(0);
        player1_points = 0;
        player2_points = 0;
        choiceOfPlayer1 = 0;
        choiceOfPlayer2 = 0;
        is_player_to_player = 0;
        BID_AMOUNT = 1 ether;
        MAX_ROUND = 3;
        round_no = 0;
        
        winner[0][0] = 0;
        winner[0][1] = 2;
        winner[0][2] = 1;
        winner[0][3] = 1;
        winner[0][4] = 2;
        winner[1][0] = 1;
        winner[1][1] = 0;
        winner[1][2] = 2;
        winner[1][3] = 2;
        winner[1][4] = 1;
        winner[2][0] = 2;
        winner[2][1] = 1;
        winner[2][2] = 0;
        winner[2][3] = 1;
        winner[2][4] = 2;
        winner[3][0] = 2;
        winner[3][1] = 1;
        winner[3][2] = 2;
        winner[3][3] = 0;
        winner[3][4] = 1;
        winner[4][0] = 1;
        winner[4][1] = 2;
        winner[4][2] = 1;
        winner[4][3] = 2;
        winner[4][4] = 0;
    }
    
    function random(uint _range) private view returns (uint) {
        uint randomnumber = uint(keccak256(abi.encodePacked(now, msg.sender, block.timestamp, block.difficulty))) % _range;
        randomnumber = randomnumber + 1;
        return randomnumber;
    }
    

    
    
    
    
    
    function PlayWithBot() external payable
    {
        require(is_player_to_player != 1, "Room not free");
        
        require(player1 == address(0), "Players limit reached.");
    
        if(player1 == address(0))
            player1 = msg.sender;
        is_player_to_player = -1;
    }
    
    function PlayWithPlayer() external payable
    {
        require(is_player_to_player != -1, "Room not free");
        
        require(player1 == address(0) || player2 == address(0), "Players limit reached.");
                
        require(msg.value == BID_AMOUNT, "You must pay 1 ETH to play the game.");
        
        
        if (player1 == address(0))
            player1 = msg.sender;
        else
            player2 = msg.sender;
            
        is_player_to_player = 1;
    }
    
    function MakeChoice(uint  _playerChoice) external returns(string memory)
    {
        require(msg.sender == player1 || msg.sender == player2, "Join Before you play.");
                
        require(1 <= _playerChoice && _playerChoice <= 5, "Invalid choice, enter in between range[1, 5].");
        
        require(round_no < MAX_ROUND);
        
        if (msg.sender == player1 && choiceOfPlayer1 == 0) 
        {
            choiceOfPlayer1 = _playerChoice;
            if(is_player_to_player == -1)
                choiceOfPlayer2 = random(5);
        } 
        else if (msg.sender == player2 && choiceOfPlayer2 == 0) 
        {
            choiceOfPlayer2 = _playerChoice;
        }
        
        if(choiceOfPlayer1 != 0 && choiceOfPlayer2 != 0)
        {
            round_no++;
            int result = winner[choiceOfPlayer1 - 1][choiceOfPlayer2 - 1];
            if(result == 1)
            {
                player1_points++;
            }
            else if(result == 2)
            {
                player2_points++;
            }
            choiceOfPlayer1 = 0;
            choiceOfPlayer2 = 0;
        }
        string memory final_result = "";
        if(round_no == MAX_ROUND)
        {
            if (player1_points == player2_points) 
            {
                if(is_player_to_player == 1)
                    owner.transfer(address(this).balance); 
                final_result = "DRAW";
            }
            else if (player1_points > player2_points) 
            {
                if(is_player_to_player == 1)
                    player1.transfer(address(this).balance);
                if(msg.sender == player1)
                    final_result = "YOU WIN";
                else if(msg.sender == player2)
                    final_result = "YOU LOSE";
            }
            else if (player1_points < player2_points) 
            {
                if(is_player_to_player == 1)
                    player2.transfer(address(this).balance);
                if(msg.sender == player1)
                    final_result = "YOU LOSE";
                else if(msg.sender == player2)
                    final_result = "YOU WIN"; 
            }
            
            player1 = address(0);
            player2 = address(0);
    
            choiceOfPlayer1 = 0;
            choiceOfPlayer2 = 0;
            
            player1_points = 0;
            player2_points = 0;
            
            is_player_to_player = 0;
            
            round_no = 0;
        }
        else
        {
            final_result = "Continue to next round";
        }
        return final_result;
    }
}