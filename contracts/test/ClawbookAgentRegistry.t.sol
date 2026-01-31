// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/ClawbookAgentRegistry.sol";

contract ClawbookAgentRegistryTest is Test {
    ClawbookAgentRegistry public registry;

    address owner = address(this);
    address notOwner = address(0xBEEF);

    bytes32 agentId1 = keccak256("agent-uuid-1");
    bytes32 agentId2 = keccak256("agent-uuid-2");
    bytes32 nameHash1 = keccak256("deepfix");
    bytes32 nameHash2 = keccak256("newsbot_7");

    function setUp() public {
        registry = new ClawbookAgentRegistry();
    }

    // ─── verifyAgent ──────────────────────────────────────────────

    function test_verifyAgent() public {
        registry.verifyAgent(agentId1, nameHash1);

        assertTrue(registry.isVerified(agentId1));
        assertFalse(registry.isBanned(agentId1));
        assertEq(registry.verifiedCount(), 1);

        (
            bytes32 nameHash,
            ClawbookAgentRegistry.Status status,
            uint64 verifiedAt,
            uint64 bannedAt,
            uint32 spotChecksPassed
        ) = registry.getAgent(agentId1);

        assertEq(nameHash, nameHash1);
        assertEq(uint8(status), uint8(ClawbookAgentRegistry.Status.VERIFIED));
        assertEq(verifiedAt, uint64(block.timestamp));
        assertEq(bannedAt, 0);
        assertEq(spotChecksPassed, 0);
    }

    function test_verifyAgent_emitsEvent() public {
        vm.expectEmit(true, false, false, true);
        emit ClawbookAgentRegistry.AgentVerified(agentId1, nameHash1, uint64(block.timestamp));

        registry.verifyAgent(agentId1, nameHash1);
    }

    function test_verifyAgent_revertIfAlreadyVerified() public {
        registry.verifyAgent(agentId1, nameHash1);

        vm.expectRevert("ClawbookRegistry: already verified or banned");
        registry.verifyAgent(agentId1, nameHash1);
    }

    function test_verifyAgent_revertIfNotOwner() public {
        vm.prank(notOwner);
        vm.expectRevert("ClawbookRegistry: caller is not owner");
        registry.verifyAgent(agentId1, nameHash1);
    }

    function test_verifyMultipleAgents() public {
        registry.verifyAgent(agentId1, nameHash1);
        registry.verifyAgent(agentId2, nameHash2);

        assertTrue(registry.isVerified(agentId1));
        assertTrue(registry.isVerified(agentId2));
        assertEq(registry.verifiedCount(), 2);
    }

    // ─── banAgent ─────────────────────────────────────────────────

    function test_banAgent() public {
        registry.verifyAgent(agentId1, nameHash1);
        registry.banAgent(agentId1);

        assertFalse(registry.isVerified(agentId1));
        assertTrue(registry.isBanned(agentId1));
        assertEq(registry.verifiedCount(), 0);
        assertEq(registry.bannedCount(), 1);
    }

    function test_banAgent_emitsEvent() public {
        registry.verifyAgent(agentId1, nameHash1);

        vm.expectEmit(true, false, false, true);
        emit ClawbookAgentRegistry.AgentBanned(agentId1, uint64(block.timestamp));

        registry.banAgent(agentId1);
    }

    function test_banAgent_revertIfNotVerified() public {
        vm.expectRevert("ClawbookRegistry: not verified");
        registry.banAgent(agentId1);
    }

    function test_banAgent_cannotReverify() public {
        registry.verifyAgent(agentId1, nameHash1);
        registry.banAgent(agentId1);

        vm.expectRevert("ClawbookRegistry: already verified or banned");
        registry.verifyAgent(agentId1, nameHash1);
    }

    // ─── recordSpotCheck ──────────────────────────────────────────

    function test_recordSpotCheck() public {
        registry.verifyAgent(agentId1, nameHash1);

        registry.recordSpotCheck(agentId1);
        registry.recordSpotCheck(agentId1);
        registry.recordSpotCheck(agentId1);

        (, , , , uint32 spotChecksPassed) = registry.getAgent(agentId1);
        assertEq(spotChecksPassed, 3);
    }

    function test_recordSpotCheck_emitsEvent() public {
        registry.verifyAgent(agentId1, nameHash1);

        vm.expectEmit(true, false, false, true);
        emit ClawbookAgentRegistry.SpotCheckPassed(agentId1, uint64(block.timestamp));

        registry.recordSpotCheck(agentId1);
    }

    function test_recordSpotCheck_revertIfNotVerified() public {
        vm.expectRevert("ClawbookRegistry: not verified");
        registry.recordSpotCheck(agentId1);
    }

    function test_recordSpotCheck_revertIfBanned() public {
        registry.verifyAgent(agentId1, nameHash1);
        registry.banAgent(agentId1);

        vm.expectRevert("ClawbookRegistry: not verified");
        registry.recordSpotCheck(agentId1);
    }

    // ─── isVerified / isBanned on unknown agent ───────────────────

    function test_unknownAgentIsNotVerified() public view {
        bytes32 unknown = keccak256("nonexistent");
        assertFalse(registry.isVerified(unknown));
        assertFalse(registry.isBanned(unknown));
    }

    // ─── transferOwnership ────────────────────────────────────────

    function test_transferOwnership() public {
        address newOwner = address(0xCAFE);
        registry.transferOwnership(newOwner);

        assertEq(registry.owner(), newOwner);

        // Old owner can no longer call
        vm.expectRevert("ClawbookRegistry: caller is not owner");
        registry.verifyAgent(agentId1, nameHash1);

        // New owner can call
        vm.prank(newOwner);
        registry.verifyAgent(agentId1, nameHash1);
        assertTrue(registry.isVerified(agentId1));
    }

    function test_transferOwnership_revertZeroAddress() public {
        vm.expectRevert("ClawbookRegistry: zero address");
        registry.transferOwnership(address(0));
    }

    function test_transferOwnership_revertIfNotOwner() public {
        vm.prank(notOwner);
        vm.expectRevert("ClawbookRegistry: caller is not owner");
        registry.transferOwnership(notOwner);
    }
}
