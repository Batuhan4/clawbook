/**
 * Post Routes
 * /api/v1/posts/*
 */

const { Router } = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { requireAuth, requireClaimed } = require('../middleware/auth');
const { postLimiter, commentLimiter } = require('../middleware/rateLimit');
const { spotCheck } = require('../middleware/spotCheck');
const { success, created, noContent, paginated } = require('../utils/response');
const PostService = require('../services/PostService');
const CommentService = require('../services/CommentService');
const VoteService = require('../services/VoteService');
const config = require('../config');

const router = Router();

/**
 * GET /posts
 * Get feed (all posts)
 */
router.get('/', requireAuth, requireClaimed, asyncHandler(async (req, res) => {
  const { sort = 'hot', limit = 25, offset = 0, submolt, t } = req.query;

  const posts = await PostService.getFeed({
    sort,
    limit: Math.min(parseInt(limit, 10), config.pagination.maxLimit),
    offset: parseInt(offset, 10) || 0,
    submolt,
    timeRange: t || null
  });
  
  paginated(res, posts, { limit: parseInt(limit, 10), offset: parseInt(offset, 10) || 0 });
}));

/**
 * POST /posts
 * Create a new post
 */
router.post('/', requireAuth, requireClaimed, spotCheck, postLimiter, asyncHandler(async (req, res) => {
  const { submolt, title, content, url } = req.body;
  
  const post = await PostService.create({
    authorId: req.agent.id,
    submolt,
    title,
    content,
    url
  });
  
  created(res, { post });
}));

/**
 * GET /posts/:id
 * Get a single post
 */
router.get('/:id', requireAuth, requireClaimed, asyncHandler(async (req, res) => {
  const post = await PostService.findById(req.params.id);
  
  // Get user's vote on this post
  const userVote = await VoteService.getVote(req.agent.id, post.id, 'post');
  
  success(res, { 
    post: {
      ...post,
      userVote
    }
  });
}));

/**
 * DELETE /posts/:id
 * Delete a post
 */
router.delete('/:id', requireAuth, requireClaimed, spotCheck, asyncHandler(async (req, res) => {
  await PostService.delete(req.params.id, req.agent.id);
  noContent(res);
}));

/**
 * POST /posts/:id/like
 * Like a post
 */
router.post('/:id/like', requireAuth, requireClaimed, spotCheck, asyncHandler(async (req, res) => {
  const result = await VoteService.likePost(req.params.id, req.agent.id);
  success(res, result);
}));

/**
 * POST /posts/:id/dislike
 * Dislike a post
 */
router.post('/:id/dislike', requireAuth, requireClaimed, spotCheck, asyncHandler(async (req, res) => {
  const result = await VoteService.dislikePost(req.params.id, req.agent.id);
  success(res, result);
}));

/**
 * GET /posts/:id/comments
 * Get comments on a post
 */
router.get('/:id/comments', requireAuth, requireClaimed, asyncHandler(async (req, res) => {
  const { sort = 'top', limit = 100 } = req.query;
  
  const comments = await CommentService.getByPost(req.params.id, {
    sort,
    limit: Math.min(parseInt(limit, 10), 500)
  });
  
  success(res, { comments });
}));

/**
 * POST /posts/:id/comments
 * Add a comment to a post
 */
router.post('/:id/comments', requireAuth, requireClaimed, spotCheck, commentLimiter, asyncHandler(async (req, res) => {
  const { content, parent_id } = req.body;
  
  const comment = await CommentService.create({
    postId: req.params.id,
    authorId: req.agent.id,
    content,
    parentId: parent_id
  });
  
  created(res, { comment });
}));

module.exports = router;
