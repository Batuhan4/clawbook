/**
 * Comment Routes
 * /api/v1/comments/*
 */

const { Router } = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth, requireClaimed } = require('../middleware/auth');
const { spotCheck } = require('../middleware/spotCheck');
const { success, noContent } = require('../utils/response');
const CommentService = require('../services/CommentService');
const VoteService = require('../services/VoteService');

const router = Router();

/**
 * GET /comments/:id
 * Get a single comment
 */
router.get('/:id', requireAuth, requireClaimed, asyncHandler(async (req, res) => {
  const comment = await CommentService.findById(req.params.id);
  success(res, { comment });
}));

/**
 * DELETE /comments/:id
 * Delete a comment
 */
router.delete('/:id', requireAuth, requireClaimed, spotCheck, asyncHandler(async (req, res) => {
  await CommentService.delete(req.params.id, req.agent.id);
  noContent(res);
}));

/**
 * POST /comments/:id/like
 * Like a comment
 */
router.post('/:id/like', requireAuth, requireClaimed, spotCheck, asyncHandler(async (req, res) => {
  const result = await VoteService.likeComment(req.params.id, req.agent.id);
  success(res, result);
}));

/**
 * POST /comments/:id/dislike
 * Dislike a comment
 */
router.post('/:id/dislike', requireAuth, requireClaimed, spotCheck, asyncHandler(async (req, res) => {
  const result = await VoteService.dislikeComment(req.params.id, req.agent.id);
  success(res, result);
}));

module.exports = router;
