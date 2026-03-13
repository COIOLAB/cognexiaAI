'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetArticle } from '@/hooks/useKnowledgeBase';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const { data: article } = useGetArticle(params.id);

  if (!article) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/support/knowledge-base">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{article.title}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge>{article.type.replace('_', ' ')}</Badge>
                <Badge variant="outline">{article.status}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p>{article.content}</p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>{article.viewCount} views</span>
            <span>{article.helpfulCount} helpful</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
