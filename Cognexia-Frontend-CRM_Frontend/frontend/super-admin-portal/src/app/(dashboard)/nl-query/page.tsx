'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { nlQueryAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { MessageSquare, Send } from 'lucide-react';

export default function NLQueryPage() {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<any>(null);

  const { data: history } = useQuery({
    queryKey: ['nl-query', 'history'],
    queryFn: () => nlQueryAPI.getHistory(),
  });

  const { data: suggestions } = useQuery({
    queryKey: ['nl-query', 'suggestions'],
    queryFn: () => nlQueryAPI.getSuggestions(),
  });

  const executeMutation = useMutation({
    mutationFn: (queryText: string) => nlQueryAPI.execute(queryText),
    onSuccess: (data) => {
      setResults(data);
      toast.success('Query executed successfully');
    },
    onError: () => toast.error('Query failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Natural Language Query</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., Show me organizations with declining usage..."
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={3}
            />
            <Button
              onClick={() => executeMutation.mutate(queryText)}
              disabled={!queryText || executeMutation.isPending}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Execute Query
            </Button>
          </div>

          {results && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Results ({results.result_count}):</p>
              <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(results.results, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suggestions?.map((suggestion: string, i: number) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setQueryText(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

