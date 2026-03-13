'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useInitiateCall, useEndCall, useTransferCall } from '@/hooks/useCalls';
import type { Call } from '@/types/api.types';
import { Phone, PhoneOff, RefreshCcw } from 'lucide-react';

interface ClickToCallProps {
  defaultNumber?: string;
  onStarted?: (call: Call) => void;
  onEnded?: (callId: string) => void;
  className?: string;
}

export default function ClickToCall({ defaultNumber = '', onStarted, onEnded, className }: ClickToCallProps) {
  const [toNumber, setToNumber] = useState(defaultNumber);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [transferAgentId, setTransferAgentId] = useState('');

  const initiate = useInitiateCall();
  const end = useEndCall();
  const transfer = useTransferCall();

  const handleStart = () => {
    if (!toNumber) return;
    initiate.mutate(
      { toNumber },
      {
        onSuccess: (call) => {
          setActiveCall(call);
          onStarted?.(call);
        },
      }
    );
  };

  const handleEnd = () => {
    if (!activeCall) return;
    end.mutate(activeCall.id, {
      onSuccess: () => {
        onEnded?.(activeCall.id);
        setActiveCall(null);
      },
    });
  };

  const handleTransfer = () => {
    if (!activeCall || !transferAgentId) return;
    transfer.mutate({ id: activeCall.id, toAgentId: transferAgentId });
  };

  const calling = initiate.isPending;
  const ending = end.isPending;
  const transferring = transfer.isPending;

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        {!activeCall ? (
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="toNumber">Phone number</Label>
              <Input
                id="toNumber"
                placeholder="e.g. +15551234567"
                value={toNumber}
                onChange={(e) => setToNumber(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleStart} disabled={!toNumber || calling} className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                {calling ? 'Calling...' : 'Call'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm">Calling {activeCall.toNumber || activeCall.fromNumber}</div>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleEnd} disabled={ending}>
                <PhoneOff className="h-4 w-4 mr-2" />
                {ending ? 'Ending...' : 'Hang up'}
              </Button>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Transfer to agentId"
                  value={transferAgentId}
                  onChange={(e) => setTransferAgentId(e.target.value)}
                  className="w-48"
                />
                <Button variant="outline" onClick={handleTransfer} disabled={!transferAgentId || transferring}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  {transferring ? 'Transferring...' : 'Transfer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
