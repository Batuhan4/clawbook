import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR, { type SWRConfiguration } from 'swr';
import { useInView } from 'react-intersection-observer';
import { api } from '@/lib/api';
import { useFeedStore, useUIStore } from '@/store';
import type { Post, Comment, Agent, Submolt, PostSort, CommentSort } from '@/types';

// Post hooks
export function usePost(postId: string, config?: SWRConfiguration) {
  return useSWR<Post>(postId ? ['post', postId] : null, () => api.getPost(postId), config);
}

export function usePosts(options: { sort?: PostSort; submolt?: string } = {}, config?: SWRConfiguration) {
  const key = ['posts', options.sort || 'hot', options.submolt || 'all'];
  return useSWR(key, () => api.getPosts({ sort: options.sort, submolt: options.submolt }), config);
}

// Comment hooks
export function useComments(postId: string, options: { sort?: CommentSort } = {}, config?: SWRConfiguration) {
  return useSWR<Comment[]>(postId ? ['comments', postId, options.sort || 'top'] : null, () => api.getComments(postId, options), config);
}

// Agent hooks
export function useAgent(name: string, config?: SWRConfiguration) {
  return useSWR<{ agent: Agent; recentPosts: Post[] }>(
    name ? ['agent', name] : null, () => api.getAgent(name), config
  );
}

// Submolt hooks
export function useSubmolt(name: string, config?: SWRConfiguration) {
  return useSWR<Submolt>(name ? ['submolt', name] : null, () => api.getSubmolt(name), config);
}

export function useSubmolts(config?: SWRConfiguration) {
  return useSWR<{ data: Submolt[] }>(['submolts'], () => api.getSubmolts(), config);
}

// Search hook (no internal debounce — caller should debounce if needed)
export function useSearch(query: string, config?: SWRConfiguration) {
  return useSWR(
    query.length >= 2 ? ['search', query] : null,
    () => api.search(query), config
  );
}

// Infinite scroll hook
export function useInfiniteScroll(onLoadMore: () => void, hasMore: boolean) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' });

  useEffect(() => {
    if (inView && hasMore) onLoadMore();
  }, [inView, hasMore, onLoadMore]);

  return { ref, inView };
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Media query hook (SSR-safe: defaults to false until client hydration)
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  // Return false on server to prevent hydration mismatch
  if (!mounted) return false;
  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 639px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

// Click outside hook
export function useClickOutside<T extends HTMLElement>(callback: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// Keyboard shortcut hook
export function useKeyboardShortcut(key: string, callback: () => void, options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        (!options.ctrl || event.ctrlKey || event.metaKey) &&
        (!options.shift || event.shiftKey) &&
        (!options.alt || event.altKey)
      ) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, options]);
}

// Toggle hook
export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle, setValue];
}
