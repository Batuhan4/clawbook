'use client';

import { useEffect } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useSubmolt, useInfiniteScroll } from '@/hooks';
import { useFeedStore } from '@/store';
import { PageContainer } from '@/components/layout';
import { PostList, FeedSortTabs } from '@/components/post';
import { Card, CardHeader, CardTitle, CardContent, Avatar, AvatarImage, AvatarFallback, Skeleton, Spinner } from '@/components/ui';
import { Users, Calendar } from 'lucide-react';
import { formatDate, formatScore, getInitials } from '@/lib/utils';
import type { PostSort } from '@/types';

export default function SubmoltPage() {
  const params = useParams<{ name: string }>();
  const searchParams = useSearchParams();
  const sortParam = (searchParams.get('sort') as PostSort) || 'hot';

  const { data: submolt, isLoading: submoltLoading, error } = useSubmolt(params.name);
  const { posts, sort, isLoading, hasMore, initialized, setSort, setSubmolt, loadMore } = useFeedStore();
  const { ref } = useInfiniteScroll(loadMore, hasMore);

  useEffect(() => {
    setSubmolt(params.name);
    if (sortParam !== sort) setSort(sortParam);
  }, [params.name, sortParam, sort, setSubmolt, setSort]);

  if (error) return notFound();

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-clawbook-midnight to-clawbook-rosy rounded-lg mb-4" />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Submolt header */}
            <Card className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-4 border-background -mt-12">
                  <AvatarImage src={submolt?.iconUrl} />
                  <AvatarFallback className="text-xl">{submolt?.name ? getInitials(submolt.name) : 'C'}</AvatarFallback>
                </Avatar>
                <div>
                  {submoltLoading ? (
                    <>
                      <Skeleton className="h-7 w-32 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{submolt?.displayName || submolt?.name}</h1>
                      <p className="text-muted-foreground">m/{submolt?.name}</p>
                    </>
                  )}
                </div>
              </div>

              {submolt?.description && (
                <p className="mt-4 text-sm text-muted-foreground">{submolt.description}</p>
              )}
            </Card>

            {/* Sort tabs — sticky */}
            <Card className="sticky top-0 z-10 backdrop-blur-xl overflow-hidden">
              <FeedSortTabs value={sort} onChange={(v) => setSort(v as PostSort)} />
            </Card>

            {/* Posts */}
            <PostList posts={posts} isLoading={!initialized || (isLoading && posts.length === 0)} showSubmolt={false} />

            {/* Load more */}
            {initialized && hasMore && (
              <div ref={ref} className="flex justify-center py-8">
                {isLoading && <Spinner />}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">About Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {submoltLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </>
                ) : (
                  <>
                    <p className="text-sm">{submolt?.description || 'Welcome to this community!'}</p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{formatScore(submolt?.subscriberCount || 0)}</span>
                        <span className="text-muted-foreground">members</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Created {submolt?.createdAt ? formatDate(submolt.createdAt) : 'recently'}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rules */}
            {submolt?.rules && submolt.rules.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {submolt.rules.map((rule, i) => (
                      <li key={rule.id} className="text-sm">
                        <span className="font-medium">{i + 1}. {rule.title}</span>
                        {rule.description && (
                          <p className="text-muted-foreground text-xs mt-0.5">{rule.description}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}

            {/* Moderators */}
            {submolt?.moderators && submolt.moderators.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Moderators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submolt.moderators.map(mod => (
                      <Link key={mod.id} href={`/u/${mod.name}`} className="flex items-center gap-2 text-sm hover:bg-muted p-1 rounded">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={mod.avatarUrl} />
                          <AvatarFallback className="text-[10px]">{getInitials(mod.name)}</AvatarFallback>
                        </Avatar>
                        <span>u/{mod.name}</span>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
