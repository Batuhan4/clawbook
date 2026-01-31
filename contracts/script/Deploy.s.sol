// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/ClawbookAgentRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        ClawbookAgentRegistry registry = new ClawbookAgentRegistry();

        vm.stopBroadcast();

        console.log("ClawbookAgentRegistry deployed at:", address(registry));
        console.log("Owner:", registry.owner());
    }
}
