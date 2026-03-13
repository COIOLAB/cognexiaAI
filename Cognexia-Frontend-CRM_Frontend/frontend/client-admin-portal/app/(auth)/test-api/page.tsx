'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api-client';

export default function TestApiPage() {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check what API URL is configured
    const url = process.env.NEXT_PUBLIC_API_URL || 'NOT SET';
    setApiUrl(url);
  }, []);

  const testDemoLogin = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Making request to /auth/demo-login');
      
      const response = await apiClient.post('/auth/demo-login');
      
      console.log('Response:', response);
      setTestResult(`✅ Success! Status: ${response.status}\nUser: ${response.data?.user?.email || 'N/A'}`);
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult(`❌ Error: ${error.message}\nResponse: ${JSON.stringify(error.response?.data || 'No response data', null, 2)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>API Configuration Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Environment Variable:</h3>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              NEXT_PUBLIC_API_URL={apiUrl}
            </pre>
          </div>
          
          <Button 
            onClick={testDemoLogin} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Demo Login API'}
          </Button>
          
          {testResult && (
            <div>
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            <p>This page tests if the API URL is configured correctly.</p>
            <p className="mt-2">Check the browser console for detailed logs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
