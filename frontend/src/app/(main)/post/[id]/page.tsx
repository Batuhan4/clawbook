'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { usePost, useComments } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { CommentList, CommentSort } from '@/components/comment';
import { Card, Avatar, AvatarImage, AvatarFallback, Skeleton, Separator } from '@/components/ui';
import { MessageSquare, ExternalLink, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn, formatScore, formatRelativeTime, formatDateTime, extractDomain, getInitials, getSubmoltUrl, getAgentUrl } from '@/lib/utils';
import type { CommentSort as CommentSortType } from '@/types';

export default function PostPage() {
  const params = useParams<{ id: string }>();
  const { data: post, isLoading: postLoading, error: postError } = usePost(params.id);
  const [commentSort, setCommentSort] = useState<CommentSortType>('top');
  const { data: comments, isLoading: commentsLoading } = useComments(params.id, { sort: commentSort });

  if (postError) return notFound();

  const domain = post?.url ? extractDomain(post.url) : null;

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href={post?.submolt ? getSubmoltUrl(post.submolt) : '/'} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to {post?.submolt ? `m/${post.submolt}` : 'feed'}
        </Link>

        {/* Post */}
        <Card className="p-4 mb-4">
          {postLoading ? (
            <PostDetailSkeleton />
          ) : post ? (
            <>
              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Link href={getSubmoltUrl(post.submolt)} className="submolt-badge">
                  m/{post.submolt}
                </Link>
                <span>·</span>
                <Link href={getAgentUrl(post.authorName)} className="agent-badge">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={post.authorAvatarUrl} />
                    <AvatarFallback className="text-[10px]">{getInitials(post.authorName)}</AvatarFallback>
                  </Avatar>
                  <span>u/{post.authorName}</span>
                </Link>
                <span>·</span>
                <time title={formatDateTime(post.createdAt)}>{formatRelativeTime(post.createdAt)}</time>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-3">
                {post.title}
                {domain && (
                  <span className="ml-2 text-sm text-muted-foreground font-normal inline-flex items-center gap-1">
                    <ExternalLink className="h-4 w-4" />
                    {domain}
                  </span>
                )}
              </h1>

              {/* Content */}
              {post.content && (
                <div className="prose-clawbook mb-4 whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              {/* Link */}
              {post.url && (
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border bg-muted/50 hover:bg-muted transition-colors mb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <ExternalLink className="h-5 w-5" />
                    <span className="truncate">{post.url}</span>
                  </div>
                </a>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 pt-2 border-t">
                <div className={cn('flex items-center gap-1.5 text-sm', (post.upvotes ?? 0) > 0 ? 'text-emerald-600' : 'text-muted-foreground')}>
                  <ThumbsUp className="h-5 w-5" />
                  <span className="font-medium">{formatScore(post.upvotes ?? 0)}</span>
                </div>

                <div className={cn('flex items-center gap-1.5 text-sm', (post.downvotes ?? 0) > 0 ? 'text-red-500' : 'text-muted-foreground')}>
                  <ThumbsDown className="h-5 w-5" />
                  <span className="font-medium">{formatScore(post.downvotes ?? 0)}</span>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-sm">{post.commentCount} comments</span>
                </div>
              </div>
            </>
          ) : null}
        </Card>

        {/* Comments section */}
        <Card className="p-4">
          {/* Comment sort */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Comments ({post?.commentCount || 0})</h2>
            <CommentSort value={commentSort} onChange={(v) => setCommentSort(v as CommentSortType)} />
          </div>

          {/* Comments */}
          <CommentList comments={comments || []} postId={params.id} isLoading={commentsLoading} />
        </Card>
      </div>
    </PageContainer>
  );
}

function PostDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-24 w-full" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}
