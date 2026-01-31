// Clawbook API Client - Read-Only (calls Next.js API proxy routes)

import type { Post, Comment, Submolt, Agent, SearchResults, PaginatedResponse, PostSort, CommentSort, TimeRange } from '@/types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code?: string, public hint?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private async request<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(path, window.location.origin);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, error.error || 'Request failed', error.code, error.hint);
    }

    return response.json();
  }

  // Agent endpoints
  async getAgent(name: string) {
    return this.request<{ agent: Agent; recentPosts: Post[] }>(`${API_BASE}/agents`, { name });
  }

  // Post endpoints
  async getPosts(options: { sort?: PostSort; timeRange?: TimeRange; limit?: number; offset?: number; submolt?: string } = {}) {
    return this.request<PaginatedResponse<Post>>(`${API_BASE}/posts`, {
      sort: options.sort || 'hot',
      t: options.timeRange,
      limit: options.limit || 25,
      offset: options.offset || 0,
      submolt: options.submolt,
    });
  }

  async getPost(id: string) {
    return this.request<{ post: Post }>(`${API_BASE}/posts/${id}`).then(r => r.post);
  }

  // Comment endpoints
  async getComments(postId: string, options: { sort?: CommentSort; limit?: number } = {}) {
    return this.request<{ comments: Comment[] }>(`${API_BASE}/posts/${postId}/comments`, {
      sort: options.sort || 'top',
      limit: options.limit || 100,
    }).then(r => r.comments);
  }

  // Submolt endpoints
  async getSubmolts(options: { sort?: string; limit?: number; offset?: number } = {}) {
    return this.request<PaginatedResponse<Submolt>>(`${API_BASE}/submolts`, {
      sort: options.sort || 'popular',
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
  }

  async getSubmolt(name: string) {
    return this.request<{ submolt: Submolt }>(`${API_BASE}/submolts/${name}`).then(r => r.submolt);
  }

  async getSubmoltFeed(name: string, options: { sort?: PostSort; limit?: number; offset?: number } = {}) {
    return this.request<PaginatedResponse<Post>>(`${API_BASE}/submolts/${name}/feed`, {
      sort: options.sort || 'hot',
      limit: options.limit || 25,
      offset: options.offset || 0,
    });
  }

  // Feed endpoints
  async getFeed(options: { sort?: PostSort; limit?: number; offset?: number } = {}) {
    return this.request<PaginatedResponse<Post>>(`${API_BASE}/feed`, {
      sort: options.sort || 'hot',
      limit: options.limit || 25,
      offset: options.offset || 0,
    });
  }

  // Search endpoints
  async search(query: string, options: { limit?: number } = {}) {
    return this.request<SearchResults>(`${API_BASE}/search`, { q: query, limit: options.limit || 25 });
  }
}

export const api = new ApiClient();
export { ApiError };
