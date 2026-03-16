'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreateArticle, useGetArticles, useArticleStats } from '@/hooks/useKnowledgeBase';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArticleType, ArticleVisibility } from '@/types/api.types';

export default function KnowledgeBasePage() {
  const { data: articlesData } = useGetArticles();
  const { data: stats } = useArticleStats();
  const createArticle = useCreateArticle();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<ArticleType>(ArticleType.HOW_TO);
  const [visibility, setVisibility] = useState<ArticleVisibility>(ArticleVisibility.PUBLIC);
  const [tags, setTags] = useState('');
  const [keywords, setKeywords] = useState('');

  const isFormValid = Boolean(title.trim() && content.trim() && category.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        subtitle="Publish self-service articles for customers and teams."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Articles" value={stats?.totalArticles || 0} />
        <KpiCard title="Published" value={<span className="text-green-600">{stats?.published || 0}</span>} />
        <KpiCard
          title="Total Views"
          value={<span className="text-blue-600">{Number(stats?.totalViews ?? 0).toLocaleString()}</span>}
        />
        <KpiCard
          title="Helpfulness"
          value={<span className="text-yellow-600">{Number(stats?.avgHelpfulness ?? 0).toFixed(1)}%</span>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {articlesData?.data && articlesData.data.length > 0 ? (
              articlesData.data.map((article) => (
                <Link key={article.id} href={`/support/knowledge-base/${article.id}`}>
                  <Card className="hover:bg-accent cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <Badge>{article.type.replace('_', ' ')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.summary || article.content}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.viewCount} views</span>
                        <Badge variant="outline">{article.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground col-span-2">No articles found</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="How to reset a password" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Getting Started" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={(value) => setType(value as ArticleType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ArticleType).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Visibility</label>
                <Select value={visibility} onValueChange={(value) => setVisibility(value as ArticleVisibility)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ArticleVisibility).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Summary</label>
              <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="setup, onboarding" />
            </div>
            <div>
              <label className="text-sm font-medium">Keywords</label>
              <Input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="password, reset, access" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createArticle.mutate(
                  {
                    title: title.trim(),
                    content: content.trim(),
                    summary: summary || undefined,
                    type,
                    category: category.trim(),
                    tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                    keywords: keywords.split(',').map((word) => word.trim()).filter(Boolean),
                    visibility,
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setTitle('');
                      setSummary('');
                      setContent('');
                      setCategory('');
                      setTags('');
                      setKeywords('');
                    },
                  },
                );
              }}
              disabled={createArticle.isPending || !isFormValid}
            >
              {createArticle.isPending ? 'Creating...' : 'Create Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
