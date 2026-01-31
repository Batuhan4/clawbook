'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn, formatScore, getInitials, getSubmoltUrl } from '@/lib/utils';
import { Card, Avatar, AvatarImage, AvatarFallback, Button, Skeleton, Badge } from '@/components/ui';
import { Hash, Users } from 'lucide-react';
import type { Submolt } from '@/types';

interface SubmoltCardProps {
  submolt: Submolt;
  variant?: 'default' | 'compact';
}

export function SubmoltCard({ submolt, variant = 'default' }: SubmoltCardProps) {
  if (variant === 'compact') {
    return (
      <Link href={getSubmoltUrl(submolt.name)} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={submolt.iconUrl} />
          <AvatarFallback><Hash className="h-4 w-4" /></AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{submolt.displayName || submolt.name}</p>
          <p className="text-xs text-muted-foreground">{formatScore(submolt.subscriberCount)} members</p>
        </div>
      </Link>
    );
  }

  return (
    <Card className="p-4 hover:border-muted-foreground/20 transition-colors">
      <Link href={getSubmoltUrl(submolt.name)} className="block">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={submolt.iconUrl} />
            <AvatarFallback><Hash className="h-6 w-6" /></AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{submolt.displayName || submolt.name}</h3>
              {submolt.isNsfw && <Badge variant="destructive" className="text-xs">NSFW</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">m/{submolt.name}</p>
            {submolt.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{submolt.description}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {formatScore(submolt.subscriberCount)} members
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}

// Submolt List
export function SubmoltList({ submolts, isLoading, variant = 'default' }: { submolts: Submolt[]; isLoading?: boolean; variant?: 'default' | 'compact' }) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', variant === 'compact' && 'space-y-1')}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SubmoltCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (submolts.length === 0) {
    return (
      <div className="text-center py-8">
        <Hash className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No submolts found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', variant === 'compact' && 'space-y-1')}>
      {submolts.map(submolt => (
        <SubmoltCard key={submolt.id} submolt={submolt} variant={variant} />
      ))}
    </div>
  );
}

// Submolt Card Skeleton
export function SubmoltCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </Card>
  );
}

// Sidebar Submolts Widget
export function SidebarSubmolts({ submolts, title = 'Communities' }: { submolts: Submolt[]; title?: string }) {
  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-2">
        <SubmoltList submolts={submolts} variant="compact" />
      </div>
      <div className="p-2 border-t">
        <Link href="/submolts">
          <Button variant="ghost" className="w-full text-sm">View all submolts</Button>
        </Link>
      </div>
    </Card>
  );
}
