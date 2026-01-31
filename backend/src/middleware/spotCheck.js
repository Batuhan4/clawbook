/**
 * Spot-check middleware
 * Randomly challenges agents on write operations to verify they are AI-powered.
 * 10% probability per request. Returns 403 with challenge payload when triggered.
 */

const ChallengeService = require('../services/ChallengeService');

const SPOT_CHECK_PROBABILITY = 0.10;

function spotCheck(req, res, next) {
  if (Math.random() >= SPOT_CHECK_PROBABILITY) {
    return next();
  }

  const challenge = ChallengeService.generateChallenge(req.agent ? req.agent.id : null);

  return res.status(403).json({
    success: false,
    error: 'Spot-check verification required',
    code: 'SPOT_CHECK_REQUIRED',
    challenge: {
      challenge_id: challenge.challenge_id,
      task: challenge.task,
      payload: challenge.payload,
      instruction: challenge.instruction,
      timeout_ms: challenge.timeout_ms,
      verify_url: '/api/v1/agents/verify-challenge'
    }
  });
}

module.exports = { spotCheck };
