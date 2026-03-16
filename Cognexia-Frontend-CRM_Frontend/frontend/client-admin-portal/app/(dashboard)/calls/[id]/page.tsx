'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Phone, Clock, User, MapPin, Tag, FileText } from 'lucide-react';
import { useGetCall, useGetCallRecording, useGetCallTranscription, useInitiateCall } from '@/hooks/useCalls';
import { CallStatus, CallDirection } from '@/types/api.types';
import { format } from 'date-fns';
import CallRecordingPlayer from '@/components/CallRecordingPlayer';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';

export default function CallDetailPage() {
  const params = useParams();
  const callId = params.id as string;

  const { data: call, isLoading } = useGetCall(callId);
  const { data: recordings = [] } = useGetCallRecording(callId);
  const { data: transcription } = useGetCallTranscription(callId);
  const initiateCall = useInitiateCall();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading call details...</div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Call not found</div>
      </div>
    );
  }

  const getStatusBadge = (status: CallStatus) => {
    const variants: Record<CallStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      [CallStatus.INITIATED]: 'secondary',
      [CallStatus.RINGING]: 'secondary',
      [CallStatus.IN_PROGRESS]: 'default',
      [CallStatus.COMPLETED]: 'default',
      [CallStatus.BUSY]: 'destructive',
      [CallStatus.NO_ANSWER]: 'destructive',
      [CallStatus.FAILED]: 'destructive',
      [CallStatus.MISSED]: 'destructive',
      [CallStatus.ON_HOLD]: 'secondary',
      [CallStatus.VOICEMAIL]: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Details"
        subtitle={call.toNumber || call.fromNumber}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const target = call.fromNumber || call.toNumber;
                if (!target) {
                  toast.error('No phone number available');
                  return;
                }
                initiateCall.mutate(
                  { toNumber: target },
                  {
                    onSuccess: () => toast.success('Call initiated'),
                    onError: () => toast.error('Failed to initiate call'),
                  },
                );
              }}
              disabled={initiateCall.isPending}
            >
              <Phone className="mr-2 h-4 w-4" />
              {initiateCall.isPending ? 'Calling...' : 'Call Back'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const payload = {
                  call,
                  recordings,
                  transcription,
                };
                const blob = new Blob([JSON.stringify(payload, null, 2)], {
                  type: 'application/json',
                });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `call-${call.id}.json`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                toast.success('Export downloaded');
              }}
            >
              Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Direction</span>
              </div>
              <Badge variant={call.direction === CallDirection.INBOUND ? 'default' : 'secondary'}>
                {call.direction}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              {getStatusBadge(call.status)}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Customer</span>
              </div>
              <div className="pl-6 text-sm">{call.customerName || 'Unknown'}</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone Number</span>
              </div>
              <div className="pl-6 text-sm">{call.toNumber || call.fromNumber}</div>
            </div>

            {call.disposition && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Disposition</span>
                </div>
                <div className="pl-6 text-sm">{call.disposition}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {call.startTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Start Time</span>
                </div>
                <span className="text-sm">{format(new Date(call.startTime), 'MMM dd, yyyy HH:mm:ss')}</span>
              </div>
            )}

            {call.answerTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Answer Time</span>
                </div>
                <span className="text-sm">{format(new Date(call.answerTime), 'MMM dd, yyyy HH:mm:ss')}</span>
              </div>
            )}

            {call.endTime && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">End Time</span>
                </div>
                <span className="text-sm">{format(new Date(call.endTime), 'MMM dd, yyyy HH:mm:ss')}</span>
              </div>
            )}

            <Separator />

            {call.duration && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Duration</span>
                  <span className="text-sm">
                    {Math.floor(call.duration / 60)}:
                    {(call.duration % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {call.ringDuration > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ring Duration</span>
                    <span className="text-sm text-muted-foreground">{call.ringDuration}s</span>
                  </div>
                )}

                {call.talkDuration > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Talk Duration</span>
                    <span className="text-sm text-muted-foreground">{call.talkDuration}s</span>
                  </div>
                )}

                {call.holdDuration > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hold Duration</span>
                    <span className="text-sm text-muted-foreground">{call.holdDuration}s</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Call Recording</CardTitle>
          </CardHeader>
          <CardContent>
            <CallRecordingPlayer recordings={recordings} />
          </CardContent>
        </Card>
      )}

      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle>Call Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-muted-foreground mb-2">
                Confidence: {Math.round(transcription.confidence * 100)}%
              </p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{transcription.transcript}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {call.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{call.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
