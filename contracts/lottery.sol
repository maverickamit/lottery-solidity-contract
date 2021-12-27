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
    function random() private view returns (uint) {
        return uint(keccak256(block.difficulty, block.timestamp, players));
    }

    //Only manager can access
    modifier restricted (){
        require(msg.sender == manager);
        _;
    }

    //picks a random winner and transfers prize money
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);
    }

    //get the list of players
    function getPlayers() public view returns(address[]) {
        return players;
    }
}
    