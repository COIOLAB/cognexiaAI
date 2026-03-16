'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, Star, Ticket, Users } from 'lucide-react';

export default function SupportAnalyticsPage() {
  const { data: statsData } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/support-tickets/stats/overview`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const stats = statsData?.data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Support Analytics
        </h1>
        <p className="text-gray-600 mt-1">
          Monitor support performance and customer satisfaction
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
                <p className="text-sm text-green-600 mt-1">+12% this month</p>
              </div>
              <Ticket className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold">{stats?.responseRate || 0}%</p>
                <p className="text-sm text-green-600 mt-1">+5% vs last month</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
                <p className="text-3xl font-bold">
                  {stats?.avgResolutionTime || 0}m
                </p>
                <p className="text-sm text-red-600 mt-1">-8% improvement</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction Score</p>
                <p className="text-3xl font-bold">{stats?.satisfactionScore || 0}/5</p>
                <p className="text-sm text-green-600 mt-1">+0.3 vs last month</p>
              </div>
              <Star className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Status Distribution</CardTitle>
          <CardDescription>Current status of all tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-blue-100 text-blue-800">Open</Badge>
                <span className="text-sm text-gray-600">New tickets</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.byStatus?.open || 0) / (stats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold w-12 text-right">
                  {stats?.byStatus?.open || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                <span className="text-sm text-gray-600">Being worked on</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.byStatus?.inProgress || 0) / (stats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold w-12 text-right">
                  {stats?.byStatus?.inProgress || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-100 text-purple-800">Waiting Response</Badge>
                <span className="text-sm text-gray-600">Awaiting customer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.byStatus?.waitingResponse || 0) / (stats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold w-12 text-right">
                  {stats?.byStatus?.waitingResponse || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                <span className="text-sm text-gray-600">Solution provided</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.byStatus?.resolved || 0) / (stats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold w-12 text-right">
                  {stats?.byStatus?.resolved || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-gray-100 text-gray-800">Closed</Badge>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-600 h-2 rounded-full"
                    style={{
                      width: `${((stats?.byStatus?.closed || 0) / (stats?.total || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold w-12 text-right">
                  {stats?.byStatus?.closed || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Most common ticket categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Technical', count: 45, color: 'bg-blue-600' },
                { name: 'Billing', count: 32, color: 'bg-yellow-600' },
                { name: 'Feature Request', count: 28, color: 'bg-green-600' },
                { name: 'Bug', count: 15, color: 'bg-red-600' },
                { name: 'Other', count: 5, color: 'bg-gray-600' },
              ].map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <span className="text-sm">{category.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`${category.color} h-2 rounded-full`}
                        style={{ width: `${(category.count / 125) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold w-8 text-right">{category.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Tickets handled by staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Support Manager', tickets: 45, rating: 4.8 },
                { name: 'Technical Specialist', tickets: 38, rating: 4.6 },
                { name: 'Support Agent', tickets: 32, rating: 4.5 },
              ].map((member) => (
                <div key={member.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.tickets} tickets</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{member.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

