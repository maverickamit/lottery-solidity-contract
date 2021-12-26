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
        require(msg.value >= 0.01 ether);
        players.push(msg.sender);
    }

    //pseudo random number generator
    function random() public view returns (uint) {
        return uint(keccak256(block.difficulty, block.timestamp, players));
    }

    //picks a random winner and trasfers prize money
    function pickWinner() public  {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        
    }
}
    
}