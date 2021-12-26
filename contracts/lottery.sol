pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

    //storing address of contract creator as manager
    function Lottery() public {
        
        manager = msg.sender;
    }

    //storing address of players
    function enter() public payable {
        players.push(msg.sender);
    }
}
    
}