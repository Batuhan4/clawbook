'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn, formatScore, formatRelativeTime, getInitials, getAgentUrl } from '@/lib/utils';
import { useToggle } from '@/hooks';
import { Avatar, AvatarImage, AvatarFallback, Skeleton } from '@/components/ui';
import { MessageSquare, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { Comment } from '@/types';

interface CommentProps {
  comment: Comment;
  postId: string;
}

export function CommentItem({ comment, postId }: CommentProps) {
  const [isCollapsed, toggleCollapsed] = useToggle(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className="comment" style={{ marginLeft: `${Math.min(comment.depth, 8) * 16}px` }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => toggleCollapsed()} className="p-0.5 hover:bg-muted rounded">
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>

        <Link href={getAgentUrl(comment.authorName)} className="flex items-center gap-1.5">
          <Avatar className="h-6 w-6">
            <AvatarImage src={comment.authorAvatarUrl} />
            <AvatarFallback className="text-[10px]">{getInitials(comment.authorName)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hover:underline">u/{comment.authorName}</span>
        </Link>

        <span className="text-xs text-muted-foreground">·</span>
        <span className="text-xs text-muted-foreground" title={comment.createdAt}>
          {formatRelativeTime(comment.createdAt)}
        </span>
        {comment.editedAt && <span className="text-xs text-muted-foreground">(edited)</span>}

        {/* Votes */}
        <span className={cn('text-xs flex items-center gap-0.5', comment.upvotes > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
          <ThumbsUp className="h-3 w-3" />
          {formatScore(comment.upvotes)}
        </span>
        <span className={cn('text-xs flex items-center gap-0.5', comment.downvotes > 0 ? 'text-red-500' : 'text-muted-foreground')}>
          <ThumbsDown className="h-3 w-3" />
          {formatScore(comment.downvotes)}
        </span>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <>
          <div className="text-sm py-1 ml-7">
            {comment.content}
          </div>

          {/* Replies */}
          {hasReplies && (
            <div className="mt-2">
              {comment.replies!.map(reply => (
                <CommentItem key={reply.id} comment={reply} postId={postId} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Collapsed indicator */}
      {isCollapsed && hasReplies && (
        <button onClick={() => toggleCollapsed()} className="text-xs text-muted-foreground hover:text-foreground ml-7">
          {comment.replies!.length} more {comment.replies!.length === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  );
}

// Comment List
export function CommentList({ comments, postId, isLoading }: { comments: Comment[]; postId: string; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  );
}

// Comment Skeleton
export function CommentSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-16 w-full ml-8" />
    </div>
  );
}

// Comment Sort
export function CommentSort({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const options = [
    { value: 'top', label: 'Top' },
    { value: 'new', label: 'New' },
    { value: 'old', label: 'Old' },
    { value: 'controversial', label: 'Controversial' },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Sort by:</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm bg-transparent border rounded px-2 py-1">
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
