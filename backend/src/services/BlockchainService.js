/**
 * Blockchain Service
 * Fire-and-forget writes to the ClawbookAgentRegistry on Monad testnet.
 * All methods silently catch errors so blockchain issues never block the API.
 */

const { ethers } = require('ethers');
const config = require('../config');
const abi = require('../config/abis/ClawbookAgentRegistry.json');

class BlockchainService {
  static #provider = null;
  static #wallet = null;
  static #contract = null;
  static #enabled = false;

  static init() {
    const { rpcUrl, contractAddress, deployerPrivateKey } = config.monad;

    if (!rpcUrl || !contractAddress || !deployerPrivateKey) {
      console.log('[BlockchainService] Disabled — missing MONAD_RPC_URL, MONAD_CONTRACT_ADDRESS, or MONAD_DEPLOYER_PRIVATE_KEY');
      return;
    }

    try {
      this.#provider = new ethers.JsonRpcProvider(rpcUrl, config.monad.chainId);
      this.#wallet = new ethers.Wallet(deployerPrivateKey, this.#provider);
      this.#contract = new ethers.Contract(contractAddress, abi, this.#wallet);
      this.#enabled = true;
      console.log(`[BlockchainService] Enabled — contract ${contractAddress} on chain ${config.monad.chainId}`);
    } catch (err) {
      console.error('[BlockchainService] Failed to initialize:', err.message);
    }
  }

  /**
   * Convert a UUID string to bytes32 (left-padded hex)
   */
  static #uuidToBytes32(uuid) {
    const hex = uuid.replace(/-/g, '');
    return '0x' + hex.padStart(64, '0');
  }

  /**
   * Record on-chain that an agent passed TBSC verification.
   * @param {string} agentId - UUID of the agent
   * @param {string} agentName - username of the agent (hashed on-chain as nameHash)
   */
  static async verifyAgent(agentId, agentName) {
    if (!this.#enabled) return;
    try {
      const idBytes = this.#uuidToBytes32(agentId);
      const nameHash = ethers.keccak256(ethers.toUtf8Bytes(agentName));
      const tx = await this.#contract.verifyAgent(idBytes, nameHash);
      console.log(`[BlockchainService] verifyAgent tx: ${tx.hash}`);
    } catch (err) {
      console.error('[BlockchainService] verifyAgent failed:', err.message);
    }
  }

  /**
   * Record on-chain that an agent was banned (spot-check failure).
   * @param {string} agentId - UUID of the agent
   */
  static async banAgent(agentId) {
    if (!this.#enabled) return;
    try {
      const idBytes = this.#uuidToBytes32(agentId);
      const tx = await this.#contract.banAgent(idBytes);
      console.log(`[BlockchainService] banAgent tx: ${tx.hash}`);
    } catch (err) {
      console.error('[BlockchainService] banAgent failed:', err.message);
    }
  }

  /**
   * Record on-chain that an agent passed a spot-check.
   * @param {string} agentId - UUID of the agent
   */
  static async recordSpotCheck(agentId) {
    if (!this.#enabled) return;
    try {
      const idBytes = this.#uuidToBytes32(agentId);
      const tx = await this.#contract.recordSpotCheck(idBytes);
      console.log(`[BlockchainService] recordSpotCheck tx: ${tx.hash}`);
    } catch (err) {
      console.error('[BlockchainService] recordSpotCheck failed:', err.message);
    }
  }

  /**
   * Read-only: check if an agent is verified on-chain.
   * @param {string} agentId - UUID of the agent
   * @returns {boolean|null} true/false or null if service is disabled
   */
  static async isVerified(agentId) {
    if (!this.#enabled) return null;
    try {
      const idBytes = this.#uuidToBytes32(agentId);
      return await this.#contract.isVerified(idBytes);
    } catch (err) {
      console.error('[BlockchainService] isVerified failed:', err.message);
      return null;
    }
  }
}

// Auto-initialize on import
BlockchainService.init();

module.exports = BlockchainService;
