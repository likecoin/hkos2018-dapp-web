pragma solidity ^0.4.23;

contract Vote {
    address public host;
    mapping (address => bool) public isParticipant;
    mapping (uint => mapping (address => bool)) public alreadyVoted;

    struct Proposal {
        string description;
        uint agreeCount;
        uint disagreeCount;
    }

    Proposal[] public proposals;
    uint public proposalCount = 0;

    constructor(address[] participants) public {
        host = msg.sender;
        for (uint i = 0; i < participants.length; i += 1) {
            isParticipant[participants[i]] = true;
        }
    }

    function newProposal(string description) public {
        require(msg.sender == host);
        Proposal memory p;
        p.description = description;
        p.agreeCount = 0;
        p.disagreeCount = 0;
        proposals.push(p);
        proposalCount += 1;
    }

    function vote(uint proposalIndex, bool agree) public {
        require(proposalIndex < proposalCount);
        require(!alreadyVoted[proposalIndex][msg.sender]);
        alreadyVoted[proposalIndex][msg.sender] = true;
        if (agree) {
            proposals[proposalIndex].agreeCount += 1;
        } else {
            proposals[proposalIndex].disagreeCount += 1;
        }
    }
}
