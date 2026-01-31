import { create } from 'zustand';
import type { Post, PostSort, TimeRange } from '@/types';
import { api } from '@/lib/api';

// Feed Store
interface FeedStore {
  posts: Post[];
  sort: PostSort;
  timeRange: TimeRange;
  submolt: string | null;
  isLoading: boolean;
  hasMore: boolean;
  offset: number;
  initialized: boolean;

  setSort: (sort: PostSort) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setSubmolt: (submolt: string | null) => void;
  loadPosts: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  sort: 'hot',
  timeRange: 'day',
  submolt: null,
  isLoading: false,
  hasMore: true,
  offset: 0,
  initialized: false,

  setSort: (sort) => {
    set({ sort, posts: [], offset: 0, hasMore: true, initialized: false });
    get().loadPosts(true);
  },

  setTimeRange: (timeRange) => {
    set({ timeRange, posts: [], offset: 0, hasMore: true, initialized: false });
    get().loadPosts(true);
  },

  setSubmolt: (submolt) => {
    set({ submolt, posts: [], offset: 0, hasMore: true, initialized: false });
    get().loadPosts(true);
  },

  loadPosts: async (reset = false) => {
    const { sort, timeRange, submolt, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const offset = reset ? 0 : get().offset;
      const response = submolt
        ? await api.getSubmoltFeed(submolt, { sort, limit: 25, offset })
        : await api.getPosts({ sort, timeRange, limit: 25, offset });

      set({
        posts: reset ? response.data : [...get().posts, ...response.data],
        hasMore: response.pagination.hasMore,
        offset: offset + response.data.length,
        isLoading: false,
        initialized: true,
      });
    } catch (err) {
      set({ isLoading: false, initialized: true });
      console.error('Failed to load posts:', err);
    }
  },

  loadMore: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    await get().loadPosts();
  },
}));

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  searchOpen: boolean;

  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  searchOpen: false,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
