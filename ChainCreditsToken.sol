// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChainCreditsToken is ERC20, Ownable {
    constructor() ERC20("ChainCreditsToken", "CCT") {}

    event TokensMinted(address indexed to, uint256 amount, string description);

    function mint(address to, uint256 amount, string memory description) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount, description);
    }
}
