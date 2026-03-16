'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { dbConsoleAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Database, Play } from 'lucide-react';

export default function DBConsolePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);

  const { data: history } = useQuery({
    queryKey: ['db-console', 'history'],
    queryFn: () => dbConsoleAPI.getHistory(),
  });

  const executeMutation = useMutation({
    mutationFn: dbConsoleAPI.execute,
    onSuccess: (data) => {
      setResults(data);
      toast.success('Query executed');
    },
    onError: (error: any) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Database className="h-8 w-8 text-gray-700" />
        <h1 className="text-3xl font-bold">Database Console</h1>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-4">
          <p className="text-sm text-yellow-800">⚠️ Warning: Direct database access. Use with caution.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SQL Query Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="SELECT * FROM organizations LIMIT 10;"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
            <Button
              onClick={() => executeMutation.mutate(query)}
              disabled={!query || executeMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Execute Query
            </Button>

            {results && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-2">Results ({results.rows_affected}):</p>
                <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
                  {JSON.stringify(results.results, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

