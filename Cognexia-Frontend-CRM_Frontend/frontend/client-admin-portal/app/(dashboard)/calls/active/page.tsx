'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PhoneIncoming, PhoneOutgoing, Clock, User, ArrowRight } from 'lucide-react';
import { useGetActiveCalls } from '@/hooks/useCalls';
import { useTelephonyLive } from '@/hooks/useTelephonyLive';
import { CallStatus, CallDirection } from '@/types/api.types';
import { formatDistanceToNow } from 'date-fns';

export default function ActiveCallsPage() {
  const { data: activeCalls = [], isLoading } = useGetActiveCalls();
  const { connected } = useTelephonyLive();

  const inboundCalls = activeCalls.filter(c => c.direction === CallDirection.INBOUND);
  const outboundCalls = activeCalls.filter(c => c.direction === CallDirection.OUTBOUND);
  const onHoldCalls = activeCalls.filter(c => c.status === CallStatus.ON_HOLD);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Calls Monitor</h1>
          <p className="text-muted-foreground">Real-time call monitoring</p>
        </div>
        <Badge variant="default" className="text-lg px-4 py-2">
          {activeCalls.length} Active {connected ? '• Live' : ''}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbound Calls</CardTitle>
            <PhoneIncoming className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inboundCalls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outbound Calls</CardTitle>
            <PhoneOutgoing className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outboundCalls.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHoldCalls.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Calls</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : activeCalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No active calls</div>
          ) : (
            <div className="space-y-4">
              {activeCalls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      {call.direction === CallDirection.INBOUND ? (
                        <PhoneIncoming className="h-5 w-5 text-green-500" />
                      ) : (
                        <PhoneOutgoing className="h-5 w-5 text-blue-500" />
                      )}
                    </div>

                  <div>
                      <div className="font-medium">{call.toNumber || call.fromNumber}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{call.customerName || 'Unknown'}</span>
                        {call.agentName && (
                          <>
                            <ArrowRight className="h-3 w-3" />
                            <span>{call.agentName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant={call.status === CallStatus.ON_HOLD ? 'secondary' : 'default'}>
                        {call.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {call.startTime && formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Transfer</Button>
                      <Button variant="outline" size="sm">Monitor</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
