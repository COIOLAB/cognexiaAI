'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [storageData, setStorageData] = useState<Record<string, string>>({});

  useEffect(() => {
    const data: Record<string, string> = {};
    const keys = ['access_token', 'accessToken', 'refresh_token', 'refreshToken', 'user'];
    
    keys.forEach(key => {
      const value = localStorage.getItem(key);
      data[key] = value ? 'EXISTS' : 'NULL';
      if (value && key === 'user') {
        try {
          const user = JSON.parse(value);
          data[key] = JSON.stringify(user, null, 2);
        } catch (e) {
          data[key] = 'INVALID JSON';
        }
      } else if (value) {
        data[key] = value.substring(0, 20) + '...';
      }
    });
    
    setStorageData(data);
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">LocalStorage Debug</h1>
        <div className="space-y-4">
          {Object.entries(storageData).map(([key, value]) => (
            <div key={key} className="border-b pb-2">
              <div className="font-semibold text-sm text-gray-600">{key}</div>
              <div className="font-mono text-sm mt-1">
                {value === 'NULL' ? (
                  <span className="text-red-600">NULL</span>
                ) : (
                  <span className="text-green-600">{value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
