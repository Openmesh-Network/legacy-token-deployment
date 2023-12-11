// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IReverseRegistrar} from "@ensdomains/ens-contracts/contracts/reverseRegistrar/IReverseRegistrar.sol";

contract MockReverseRegistrar is IReverseRegistrar {
    function setDefaultResolver(address resolver) external pure {}

    function claim(address) external pure returns (bytes32) {
        return 0;
    }

    function claimForAddr(
        address,
        address,
        address
    ) external pure returns (bytes32) {
        return 0;
    }

    function claimWithResolver(
        address,
        address
    ) external pure returns (bytes32) {
        return 0;
    }

    function setName(string memory) external pure returns (bytes32) {
        return 0;
    }

    function setNameForAddr(
        address,
        address,
        address,
        string memory
    ) external pure returns (bytes32) {
        return 0;
    }

    function node(address) external pure returns (bytes32) {
        return 0;
    }
}
