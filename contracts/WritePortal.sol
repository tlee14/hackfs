// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract WritePortal {
    uint256 totalWrites;
    address lastWriter;

    event NewWrite(address indexed from, uint256 timestamp, string description);

    struct Write {
        address writer;
        string description;
        uint256 timestamp;
    }

    Write[] writes;

    mapping(address => uint256) public lastWroteAt;

    function write(string memory _description) public {
        require(
            lastWroteAt[msg.sender] + 30 seconds < block.timestamp,
            "Must wait 30 seconds before writing again."
        );

        lastWroteAt[msg.sender] = block.timestamp;

        totalWrites += 1;
        // console.log("%s wrote w/ description %s", msg.sender, _description);

        writes.push(Write(msg.sender, _description, block.timestamp));

        // console.log("Random # generated: %d", seed);

        emit NewWrite(msg.sender, block.timestamp, _description);

    }

    function getAllWrites() public view returns (Write[] memory) {
        return writes;
    }

    function getLastWriter() public view returns (address) {
        return lastWriter;
    }

    function getTotalWrites() public view returns (uint256) {
        // console.log("We have %d total writes!", totalWrites);
        return totalWrites;
    }
}