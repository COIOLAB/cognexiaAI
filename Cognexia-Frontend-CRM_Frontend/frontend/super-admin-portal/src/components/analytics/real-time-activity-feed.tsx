'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  FileText, 
  Mail, 
  Calendar,
  Workflow,
  Database,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityEvent {
  id: string;
  organizationId: string;
  organizationName: string;
  userId: string;
  userName: string;
  action: string;
  category: string;
  label: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RealTimeActivityFeedProps {
  organizationId?: string; // Optional: filter by organization
  limit?: number;
}

export function RealTimeActivityFeed({ 
  organizationId, 
  limit = 50 
}: RealTimeActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Fetch initial activities
    fetchActivities();

    // Set up WebSocket for real-time updates
    const ws = connectWebSocket();

    return () => {
      ws?.close();
    };
  }, [organizationId]);

  const fetchActivities = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const url = organizationId
        ? `${apiBase}/analytics/activities?organizationId=${organizationId}&limit=${limit}`
        : `${apiBase}/analytics/activities?limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    }
  };

  const connectWebSocket = () => {
    try {
      // WebSocket connection for real-time updates
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      const wsHost = apiUrl ? new URL(apiUrl).host : 'localhost:3003';
      const wsUrl = `ws://${wsHost}/analytics/live`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected - real-time updates enabled');
        setConnected(true);

        // Subscribe to organization-specific or all activities
        ws.send(JSON.stringify({
          type: 'subscribe',
          organizationId: organizationId || 'all',
        }));
      };

      ws.onmessage = (event) => {
        try {
          const newActivity = JSON.parse(event.data);
          
          // Add new activity to the top of the list
          setActivities(prev => [newActivity, ...prev].slice(0, limit));
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = () => {
        // Silently handle WebSocket errors - component works fine without real-time updates
        setConnected(false);
      };

      ws.onclose = () => {
        console.log('ℹ️ WebSocket disconnected - using polling mode');
        setConnected(false);

        // Don't auto-reconnect to avoid error spam
        // Real-time updates are optional - the component fetches data on load
      };

      return ws;
    } catch (error) {
      // Silently fail - WebSocket is optional for this component
      console.log('ℹ️ WebSocket not available - using static mode');
      return null;
    }
  };

  const getActivityIcon = (category: string) => {
    switch (category) {
      case 'user': return Users;
      case 'document': return FileText;
      case 'feature': return Activity;
      case 'navigation': return Eye;
      case 'email': return Mail;
      case 'calendar': return Calendar;
      case 'workflow': return Workflow;
      case 'api': return Database;
      default: return Activity;
    }
  };

  const getActivityColor = (category: string) => {
    switch (category) {
      case 'user': return 'text-blue-600 bg-blue-100';
      case 'document': return 'text-green-600 bg-green-100';
      case 'feature': return 'text-purple-600 bg-purple-100';
      case 'navigation': return 'text-gray-600 bg-gray-100';
      case 'email': return 'text-red-600 bg-red-100';
      case 'workflow': return 'text-indigo-600 bg-indigo-100';
      case 'api': return 'text-cyan-600 bg-cyan-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Activity Feed
            </CardTitle>
            <CardDescription>
              {organizationId 
                ? 'Live activity for this organization' 
                : 'Live activity across all organizations'
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No activity yet</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.category);
              const colorClass = getActivityColor(activity.category);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.userName}
                          <span className="text-gray-500 font-normal"> {activity.action}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {activity.label}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    
                    {!organizationId && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {activity.organizationName}
                      </Badge>
                    )}

                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {JSON.stringify(activity.metadata, null, 2).slice(0, 100)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activities.length >= limit && (
          <div className="text-center mt-4">
            <button
              onClick={fetchActivities}
              className="text-sm text-blue-600 hover:underline"
            >
              Load more
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
