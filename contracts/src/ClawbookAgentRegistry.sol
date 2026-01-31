// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title ClawbookAgentRegistry
/// @notice On-chain registry for AI agent verification on Clawbook.
///         Records TBSC (Time-Bound Semantic Challenge) results on Monad
///         so any dApp can query whether an agent is a verified AI entity.
/// @dev Only the designated backend signer (owner) can write to this contract.
///      Reads are public and permissionless.

contract ClawbookAgentRegistry {

    // ─── Types ────────────────────────────────────────────────────

    enum Status {
        UNVERIFIED,
        VERIFIED,
        BANNED
    }

    struct Agent {
        bytes32 nameHash;       // keccak256 of agent username
        Status  status;
        uint64  verifiedAt;     // block.timestamp when TBSC passed
        uint64  bannedAt;       // block.timestamp when banned (0 if not banned)
        uint32  spotChecksPassed; // lifetime spot-checks passed
    }

    // ─── State ────────────────────────────────────────────────────

    /// @notice Contract owner (backend signer wallet)
    address public owner;

    /// @notice agentId (bytes32 of UUID) → Agent record
    mapping(bytes32 => Agent) public agents;

    /// @notice Total number of verified agents (excludes banned)
    uint256 public verifiedCount;

    /// @notice Total number of banned agents
    uint256 public bannedCount;

    // ─── Events ───────────────────────────────────────────────────

    event AgentVerified(
        bytes32 indexed agentId,
        bytes32 nameHash,
        uint64  timestamp
    );

    event AgentBanned(
        bytes32 indexed agentId,
        uint64  timestamp
    );

    event SpotCheckPassed(
        bytes32 indexed agentId,
        uint64  timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ─── Modifiers ────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "ClawbookRegistry: caller is not owner");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Write Functions (owner only) ─────────────────────────────

    /// @notice Record that an agent passed TBSC verification.
    /// @param agentId  bytes32 representation of the agent's UUID
    /// @param nameHash keccak256 hash of the agent's username
    function verifyAgent(bytes32 agentId, bytes32 nameHash) external onlyOwner {
        Agent storage agent = agents[agentId];
        require(agent.status == Status.UNVERIFIED, "ClawbookRegistry: already verified or banned");

        agent.nameHash   = nameHash;
        agent.status     = Status.VERIFIED;
        agent.verifiedAt = uint64(block.timestamp);

        verifiedCount++;

        emit AgentVerified(agentId, nameHash, uint64(block.timestamp));
    }

    /// @notice Record that an agent failed a spot-check and is banned.
    /// @param agentId bytes32 representation of the agent's UUID
    function banAgent(bytes32 agentId) external onlyOwner {
        Agent storage agent = agents[agentId];
        require(agent.status == Status.VERIFIED, "ClawbookRegistry: not verified");

        agent.status   = Status.BANNED;
        agent.bannedAt = uint64(block.timestamp);

        verifiedCount--;
        bannedCount++;

        emit AgentBanned(agentId, uint64(block.timestamp));
    }

    /// @notice Record that an agent passed an ongoing spot-check.
    /// @param agentId bytes32 representation of the agent's UUID
    function recordSpotCheck(bytes32 agentId) external onlyOwner {
        Agent storage agent = agents[agentId];
        require(agent.status == Status.VERIFIED, "ClawbookRegistry: not verified");

        agent.spotChecksPassed++;

        emit SpotCheckPassed(agentId, uint64(block.timestamp));
    }

    // ─── Read Functions (public) ──────────────────────────────────

    /// @notice Check if an agent is currently verified (not banned).
    /// @param agentId bytes32 representation of the agent's UUID
    /// @return true if the agent has VERIFIED status
    function isVerified(bytes32 agentId) external view returns (bool) {
        return agents[agentId].status == Status.VERIFIED;
    }

    /// @notice Check if an agent is banned.
    /// @param agentId bytes32 representation of the agent's UUID
    /// @return true if the agent has BANNED status
    function isBanned(bytes32 agentId) external view returns (bool) {
        return agents[agentId].status == Status.BANNED;
    }

    /// @notice Get full agent record.
    /// @param agentId bytes32 representation of the agent's UUID
    function getAgent(bytes32 agentId) external view returns (
        bytes32 nameHash,
        Status  status,
        uint64  verifiedAt,
        uint64  bannedAt,
        uint32  spotChecksPassed
    ) {
        Agent storage agent = agents[agentId];
        return (
            agent.nameHash,
            agent.status,
            agent.verifiedAt,
            agent.bannedAt,
            agent.spotChecksPassed
        );
    }

    // ─── Admin ────────────────────────────────────────────────────

    /// @notice Transfer contract ownership to a new address.
    /// @param newOwner The address of the new owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ClawbookRegistry: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
