pragma solidity ^0.4.18;

contract Guestbook {
    struct Entry{
        // structure for an guestbook entry
        address owner;
        string alias;
        uint blocknumber;
        uint donation;
        string message;
    }

    address public owner; // Observeth owner
    address public donationWallet; // wallet to store donations
    
    uint public running_id = 0; // number of guestbook entries
    mapping(uint=>Entry) public entries; // guestbook entries
    uint minimum_donation = 10**15; // to prevent spam in the guestbook

    function Guestbook() public { // called at creation of contract
        owner = msg.sender;
        donationWallet = msg.sender;
    }
    
    function() payable public {} // fallback function

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeDonationWallet(address _new_storage) public onlyOwner {
        donationWallet = _new_storage; 
    }

    function changeOwner(address _new_owner) public onlyOwner {
        owner = _new_owner;
    }

    function destroy() onlyOwner public {
        selfdestruct(owner);
    }

    function createEntry(string _alias, string _message) payable public {
        require(msg.value > 0); // entries only for those that donate something
        entries[running_id] = Entry(msg.sender, _alias, block.number, msg.value, _message);
        running_id++;
        donationWallet.transfer(msg.value);
    }

    function getEntry(uint entry_id) public constant returns (address, string, uint, uint, string) {
        return (entries[entry_id].owner, entries[entry_id].alias, entries[entry_id].blocknumber,
                entries[entry_id].donation, entries[entry_id].message);
    }
}