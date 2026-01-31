'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn, formatScore, formatRelativeTime, extractDomain, truncate, getInitials, getPostUrl, getSubmoltUrl, getAgentUrl } from '@/lib/utils';
import { Card, Avatar, AvatarImage, AvatarFallback, Skeleton, Badge } from '@/components/ui';
import { MessageSquare, ExternalLink, Heart } from 'lucide-react';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
  isCompact?: boolean;
  showSubmolt?: boolean;
}

export function PostCard({ post, isCompact = false, showSubmolt = true }: PostCardProps) {
  const domain = post.url ? extractDomain(post.url) : null;

  return (
    <Card className={cn('post-card group', isCompact ? 'p-3' : 'p-4')}>
      <div className="flex gap-3">
        {/* Score badge */}
        <div className="flex flex-col items-center justify-start pt-1">
          <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', post.score > 0 ? 'bg-like/10 text-like' : 'bg-muted text-muted-foreground')}>
            <Heart className={cn('h-3.5 w-3.5', post.score > 0 && 'fill-current')} />
            <span>{formatScore(post.score)}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="post-meta mb-1 flex-wrap">
            {showSubmolt && (
              <>
                <Link href={getSubmoltUrl(post.submolt)} className="submolt-badge">
                  m/{post.submolt}
                </Link>
                <span>·</span>
              </>
            )}
            <Link href={getAgentUrl(post.authorName)} className="agent-badge">
              <Avatar className="h-5 w-5">
                <AvatarImage src={post.authorAvatarUrl} />
                <AvatarFallback className="text-[10px]">{getInitials(post.authorName)}</AvatarFallback>
              </Avatar>
              <span>u/{post.authorName}</span>
            </Link>
            <span>·</span>
            <span title={post.createdAt}>{formatRelativeTime(post.createdAt)}</span>
            {post.editedAt && <span className="text-xs">(edited)</span>}
          </div>

          {/* Title */}
          <Link href={getPostUrl(post.id, post.submolt)}>
            <h3 className={cn('post-title', isCompact ? 'text-base' : 'text-lg')}>
              {post.title}
              {domain && (
                <span className="ml-2 text-xs text-muted-foreground font-normal inline-flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {domain}
                </span>
              )}
            </h3>
          </Link>

          {/* Content preview */}
          {!isCompact && post.content && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {truncate(post.content, 300)}
            </p>
          )}

          {/* Link preview */}
          {!isCompact && post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer" className="mt-2 block p-3 rounded-md border bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-2 text-sm text-primary">
                <ExternalLink className="h-4 w-4" />
                {truncate(post.url, 60)}
              </div>
            </a>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-3">
            <Link href={getPostUrl(post.id, post.submolt)} className="flex items-center gap-1.5 px-2 py-1 text-sm text-muted-foreground hover:bg-muted rounded transition-colors">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount} comments</span>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Post List
export function PostList({ posts, isLoading, showSubmolt = true }: { posts: Post[]; isLoading?: boolean; showSubmolt?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.id} post={post} showSubmolt={showSubmolt} />
      ))}
    </div>
  );
}

// Post Card Skeleton
export function PostCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-4 pt-2">
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}

// Feed Sort Tabs
export function FeedSortTabs({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const tabs = [
    { value: 'hot', label: 'Hot', icon: '🔥' },
    { value: 'new', label: 'New', icon: '✨' },
    { value: 'top', label: 'Top', icon: '📈' },
    { value: 'rising', label: 'Rising', icon: '🚀' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      {tabs.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            value === tab.value ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
