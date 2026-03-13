'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCreateMarketingContent, useMarketingContent } from '@/hooks/useMarketingContent';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContentPage() {
  const { data: content, isLoading } = useMarketingContent();
  const createContent = useCreateMarketingContent();
  const [open, setOpen] = useState(false);
  const [contentType, setContentType] = useState('general');
  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [model, setModel] = useState('');

  const isFormValid = Boolean(contentType.trim() && prompt.trim() && generatedText.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Library"
        subtitle="Browse AI-generated and curated marketing assets."
        actions={
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </Button>
        }
      />
      <Card>
        <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading content…</p>
          ) : content && content.length > 0 ? (
            <div className="space-y-4">
              {content.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{item.prompt || 'Untitled content'}</div>
                      <div className="text-xs text-muted-foreground">Model: {item.model || 'manual'}</div>
                    </div>
                    <Badge variant="outline">{item.contentType || 'general'}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                    {item.generatedText || 'No content text available.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No content generated yet.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Content Type</label>
              <Input value={contentType} onChange={(event) => setContentType(event.target.value)} placeholder="blog, email, ad" />
            </div>
            <div>
              <label className="text-sm font-medium">Prompt</label>
              <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Generated Text</label>
              <Textarea value={generatedText} onChange={(event) => setGeneratedText(event.target.value)} rows={6} />
            </div>
            <div>
              <label className="text-sm font-medium">Model (optional)</label>
              <Input value={model} onChange={(event) => setModel(event.target.value)} placeholder="gpt-4o, gemini, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!isFormValid) return;
                createContent.mutate(
                  {
                    contentType: contentType.trim(),
                    prompt: prompt.trim(),
                    generatedText: generatedText.trim(),
                    model: model.trim() || undefined,
                  },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setContentType('general');
                      setPrompt('');
                      setGeneratedText('');
                      setModel('');
                    },
                  },
                );
              }}
              disabled={createContent.isPending || !isFormValid}
            >
              {createContent.isPending ? 'Creating...' : 'Create Content'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
