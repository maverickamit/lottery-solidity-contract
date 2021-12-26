pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    
    //storing address of contract creator as manager
    function Lottery() public {
        manager = msg.sender;
    }
    
}