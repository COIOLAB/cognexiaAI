'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GripVertical, X } from 'lucide-react';
import { mobileApi } from '@/services/mobile.api';
import { organizationApi } from '@/services/organization.api';
import { userApi } from '@/services/user.api';
import { useAuthStore } from '@/stores/auth-store';
import apiClient from '@/lib/api-client';

export default function MobilePage() {
  const { user, updateUser } = useAuthStore();
  const userId = user?.id;

  const [deviceIdInput, setDeviceIdInput] = useState('device-1');
  const [deviceNameInput, setDeviceNameInput] = useState('Pixel 9 Pro');
  const [devicePlatformInput, setDevicePlatformInput] = useState('ANDROID');
  const [devicePushTokenInput, setDevicePushTokenInput] = useState('demo-token');
  const [notificationTitle, setNotificationTitle] = useState('Hello');
  const [notificationBody, setNotificationBody] = useState('Test notification');
  const [notificationCategory, setNotificationCategory] = useState('ALERT');
  const [notificationChannel, setNotificationChannel] = useState('PUSH');
  const [notificationToPhone, setNotificationToPhone] = useState('');
  const [userPhoneNumber, setUserPhoneNumber] = useState(user?.phoneNumber || '');
  const [otpCode, setOtpCode] = useState('');
  const [devicePairId, setDevicePairId] = useState('');
  const [devicePairOtp, setDevicePairOtp] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateLocale, setTemplateLocale] = useState('en-US');
  const [templateChannel, setTemplateChannel] = useState('PUSH');
  const [templateTitle, setTemplateTitle] = useState('Hello {{name}}');
  const [templateBody, setTemplateBody] = useState('Your update is ready, {{name}}.');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateVarKey, setTemplateVarKey] = useState('name');
  const [templateVarValue, setTemplateVarValue] = useState('Alex');
  const [templateVarPairs, setTemplateVarPairs] = useState<Array<{ key: string; value: string }>>([
    { key: 'name', value: 'Alex' },
  ]);
  const [mergedConflictPayloads, setMergedConflictPayloads] = useState<Record<string, string>>({});
  const [messagingChannel, setMessagingChannel] = useState('PUSH');
  const [fallbackChannel, setFallbackChannel] = useState('SMS');
  const [smsProvider, setSmsProvider] = useState('TWILIO');
  const [whatsappProvider, setWhatsappProvider] = useState('TWILIO');
  const [voiceProvider, setVoiceProvider] = useState('TWILIO');
  const [smsFrom, setSmsFrom] = useState('');
  const [whatsappFrom, setWhatsappFrom] = useState('');
  const [voiceFrom, setVoiceFrom] = useState('');
  const [quietStart, setQuietStart] = useState('');
  const [quietEnd, setQuietEnd] = useState('');
  const [escalationMinutes, setEscalationMinutes] = useState('15');
  const [escalationChannel, setEscalationChannel] = useState('SMS');
  const [escalationProvider, setEscalationProvider] = useState('TWILIO');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [vonageApiKey, setVonageApiKey] = useState('');
  const [vonageApiSecret, setVonageApiSecret] = useState('');
  const [vonageApplicationId, setVonageApplicationId] = useState('');
  const [vonagePrivateKey, setVonagePrivateKey] = useState('');
  const [messageBirdAccessKey, setMessageBirdAccessKey] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [routingChannel, setRoutingChannel] = useState('PUSH');
  const [routingProvider, setRoutingProvider] = useState('TWILIO');
  const [userSegment, setUserSegment] = useState('');
  const [userVip, setUserVip] = useState('NO');
  const [routingRules, setRoutingRules] = useState<any[]>([]);
  const [ruleName, setRuleName] = useState('');
  const [ruleOperator, setRuleOperator] = useState('AND');
  const [ruleChannel, setRuleChannel] = useState('SMS');
  const [ruleProvider, setRuleProvider] = useState('TWILIO');
  const [conditionField, setConditionField] = useState('segment');
  const [conditionValue, setConditionValue] = useState('');
  const [ruleConditions, setRuleConditions] = useState<Array<{ field: string; value: string }>>([]);
  const [ruleGroups, setRuleGroups] = useState<
    Array<{ operator: string; conditions: Array<{ field: string; value: string }> }>
  >([]);
  const [groupOperator, setGroupOperator] = useState('AND');
  const [segmentSearch, setSegmentSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [dragRuleIndex, setDragRuleIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const devicesQuery = useQuery({
    queryKey: ['mobile', 'devices'],
    queryFn: () => mobileApi.getDevices(),
  });

  const notificationsQuery = useQuery({
    queryKey: ['mobile', 'notifications'],
    queryFn: () => mobileApi.getNotifications(),
  });

  const statsQuery = useQuery({
    queryKey: ['mobile', 'sync', 'stats'],
    queryFn: () => mobileApi.getSyncStats(),
  });

  const organizationQuery = useQuery({
    queryKey: ['organization', 'me'],
    queryFn: () => organizationApi.request({ url: 'me/organization', method: 'GET' }),
    enabled: Boolean(userId),
  });

  const userProfileQuery = useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApi.getById(userId as string),
    enabled: Boolean(userId),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: any) => mobileApi.registerDevice(payload),
    onSuccess: () => {
      toast.success('Device registered');
      devicesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to register device');
    },
  });

  const notifyMutation = useMutation({
    mutationFn: (payload: any) => mobileApi.sendNotification(payload),
    onSuccess: () => {
      toast.success('Notification sent');
      notificationsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send notification');
    },
  });

  const saveMessagingSettingsMutation = useMutation({
    mutationFn: (payload: any) =>
      organizationApi.update((organizationQuery.data as any)?.id, payload),
    onSuccess: () => {
      toast.success('Messaging settings updated');
      organizationQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update messaging settings');
    },
  });

  const updatePhoneMutation = useMutation({
    mutationFn: (payload: any) => userApi.update(userId as string, payload),
    onSuccess: (data: any) => {
      toast.success('Phone number updated');
      const updated = data?.data?.phoneNumber || userPhoneNumber;
      if (updated) {
        updateUser({ phoneNumber: updated });
      }
      userProfileQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update phone number');
    },
  });

  const updateRoutingMutation = useMutation({
    mutationFn: (payload: any) => userApi.update(userId as string, payload),
    onSuccess: () => {
      toast.success('Routing preferences updated');
      userProfileQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update routing');
    },
  });

  const otpRequestMutation = useMutation({
    mutationFn: (phone: string) => mobileApi.requestPhoneOtp(phone),
    onSuccess: () => toast.success('OTP sent'),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send OTP');
    },
  });

  const otpVerifyMutation = useMutation({
    mutationFn: (payload: { phone: string; otp: string }) =>
      mobileApi.verifyPhoneOtp(payload.phone, payload.otp),
    onSuccess: () => {
      toast.success('Phone verified');
      userProfileQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'OTP verification failed');
    },
  });

  const templatesQuery = useQuery({
    queryKey: ['mobile', 'templates'],
    queryFn: () => mobileApi.getTemplates(),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (payload: any) => mobileApi.createTemplate(payload),
    onSuccess: () => {
      toast.success('Template created');
      templatesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create template');
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: string) => mobileApi.deleteTemplate(id),
    onSuccess: () => {
      toast.success('Template deleted');
      templatesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template');
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: (payload: { id: string; data: any }) =>
      mobileApi.updateTemplate(payload.id, payload.data),
    onSuccess: () => {
      toast.success('Template updated');
      templatesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update template');
    },
  });

  const providerHealthQuery = useQuery({
    queryKey: ['mobile', 'providers', 'health'],
    queryFn: () => mobileApi.getProviderHealth(),
  });

  const refreshProviderHealthMutation = useMutation({
    mutationFn: () => mobileApi.refreshProviderHealth(),
    onSuccess: () => {
      toast.success('Provider health refreshed');
      providerHealthQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to refresh health');
    },
  });

  const conflictsQuery = useQuery({
    queryKey: ['mobile', 'sync', 'conflicts'],
    queryFn: () => mobileApi.getSyncConflicts(),
  });

  const segmentsQuery = useQuery({
    queryKey: ['marketing', 'segments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/marketing/segments');
      return data?.data || data || [];
    },
  });

  const segmentStatsQuery = useQuery({
    queryKey: ['marketing', 'segments', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/marketing/segments/stats');
      return data?.data || data || [];
    },
  });

  const resolveConflictMutation = useMutation({
    mutationFn: (payload: any) => mobileApi.resolveSyncConflict(payload),
    onSuccess: () => {
      toast.success('Conflict resolved');
      conflictsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to resolve conflict');
    },
  });

  const pairDeviceMutation = useMutation({
    mutationFn: (payload: { deviceId: string; otp: string }) =>
      mobileApi.pairDevice(payload.deviceId, payload.otp),
    onSuccess: () => {
      toast.success('Device paired');
      devicesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to pair device');
    },
  });

  const devices = Array.isArray(devicesQuery.data) ? devicesQuery.data : [];
  const notifications = Array.isArray(notificationsQuery.data) ? notificationsQuery.data : [];
  const organization = organizationQuery.data as any;
  const messagingSettings = organization?.settings?.messaging || {};
  const userProfile = (userProfileQuery.data as any)?.data || (userProfileQuery.data as any);

  useEffect(() => {
    if (messagingSettings.channel) {
      setMessagingChannel(String(messagingSettings.channel).toUpperCase());
    }
    if (messagingSettings.fallbackChannel) {
      setFallbackChannel(String(messagingSettings.fallbackChannel).toUpperCase());
    }
    if (messagingSettings.smsProvider) {
      setSmsProvider(String(messagingSettings.smsProvider).toUpperCase());
    }
    if (messagingSettings.whatsappProvider) {
      setWhatsappProvider(String(messagingSettings.whatsappProvider).toUpperCase());
    }
    if (messagingSettings.voiceProvider) {
      setVoiceProvider(String(messagingSettings.voiceProvider).toUpperCase());
    }
    if (messagingSettings.fromNumbers?.sms) {
      setSmsFrom(String(messagingSettings.fromNumbers.sms));
    }
    if (messagingSettings.fromNumbers?.whatsapp) {
      setWhatsappFrom(String(messagingSettings.fromNumbers.whatsapp));
    }
    if (messagingSettings.fromNumbers?.voice) {
      setVoiceFrom(String(messagingSettings.fromNumbers.voice));
    }
    if (messagingSettings.quietHours?.start) {
      setQuietStart(String(messagingSettings.quietHours.start));
    }
    if (messagingSettings.quietHours?.end) {
      setQuietEnd(String(messagingSettings.quietHours.end));
    }
    if (messagingSettings.escalation?.[0]?.afterMinutes) {
      setEscalationMinutes(String(messagingSettings.escalation[0].afterMinutes));
    }
    if (messagingSettings.escalation?.[0]?.channel) {
      setEscalationChannel(String(messagingSettings.escalation[0].channel).toUpperCase());
    }
    if (messagingSettings.escalation?.[0]?.provider) {
      setEscalationProvider(String(messagingSettings.escalation[0].provider).toUpperCase());
    }
    if (messagingSettings.credentials?.twilio?.accountSid) {
      setTwilioAccountSid(String(messagingSettings.credentials.twilio.accountSid));
    }
    if (messagingSettings.credentials?.twilio?.authToken) {
      setTwilioAuthToken(String(messagingSettings.credentials.twilio.authToken));
    }
    if (messagingSettings.credentials?.vonage?.apiKey) {
      setVonageApiKey(String(messagingSettings.credentials.vonage.apiKey));
    }
    if (messagingSettings.credentials?.vonage?.apiSecret) {
      setVonageApiSecret(String(messagingSettings.credentials.vonage.apiSecret));
    }
    if (messagingSettings.credentials?.vonage?.applicationId) {
      setVonageApplicationId(String(messagingSettings.credentials.vonage.applicationId));
    }
    if (messagingSettings.credentials?.vonage?.privateKey) {
      setVonagePrivateKey(String(messagingSettings.credentials.vonage.privateKey));
    }
    if (messagingSettings.credentials?.messagebird?.accessKey) {
      setMessageBirdAccessKey(String(messagingSettings.credentials.messagebird.accessKey));
    }
    if (Array.isArray(messagingSettings.routingRules)) {
      setRoutingRules(messagingSettings.routingRules);
    }
  }, [messagingSettings]);

  useEffect(() => {
    if (userProfile?.phoneNumber) {
      setUserPhoneNumber(userProfile.phoneNumber);
    }
    const routing = userProfile?.preferences?.notificationRouting;
    if (routing?.preferredChannel) {
      setRoutingChannel(String(routing.preferredChannel).toUpperCase());
    }
    if (routing?.provider) {
      setRoutingProvider(String(routing.provider).toUpperCase());
    }
    if (userProfile?.preferences?.segment || userProfile?.metadata?.segment) {
      setUserSegment(String(userProfile?.preferences?.segment || userProfile?.metadata?.segment));
    }
    if (typeof userProfile?.preferences?.vip === 'boolean') {
      setUserVip(userProfile.preferences.vip ? 'YES' : 'NO');
    } else if (typeof userProfile?.metadata?.vip === 'boolean') {
      setUserVip(userProfile.metadata.vip ? 'YES' : 'NO');
    }
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile?.phoneNumber) return;
    if (!notificationToPhone) {
      setNotificationToPhone(String(userProfile.phoneNumber));
    }
  }, [notificationToPhone, userProfile?.phoneNumber]);
  const syncStats = statsQuery.data ?? {};
  const lastSyncAt = syncStats?.lastSyncAt || syncStats?.lastSync || syncStats?.lastSyncTime;
  const pendingSyncs =
    syncStats?.pending ?? syncStats?.pendingSyncs ?? syncStats?.pendingCount ?? 0;
  const failedSyncs = syncStats?.failed ?? syncStats?.failedSyncs ?? syncStats?.failedCount ?? 0;
  const successSyncs =
    syncStats?.synced ??
    syncStats?.syncedCount ??
    syncStats?.successCount ??
    syncStats?.totalSynced ??
    0;

  const androidSamplePayload = {
    deviceId: 'device-2',
    deviceName: 'Galaxy S24',
    platform: 'ANDROID',
    pushToken: 'demo-token',
  };
  const iosSamplePayload = {
    deviceId: 'device-3',
    deviceName: 'iPhone 15 Pro',
    platform: 'IOS',
    pushToken: 'demo-token',
  };

  const baseNotificationPayload = useMemo(
    () => ({
      userId: userId || '',
      category: 'ALERT',
      channel: messagingChannel,
      toPhoneNumber: userPhoneNumber || undefined,
    }),
    [messagingChannel, userId, userPhoneNumber]
  );

  const parsedTemplateVariables = useMemo(() => {
    const variables: Record<string, any> = {};
    templateVarPairs.forEach((pair) => {
      if (pair.key) {
        variables[pair.key] = pair.value;
      }
    });
    return variables;
  }, [templateVarPairs]);

  const selectedTemplate = useMemo(() => {
    const list = templatesQuery.data || [];
    return list.find((template: any) => template.id === selectedTemplateId);
  }, [selectedTemplateId, templatesQuery.data]);

  const notificationPreview = useMemo(() => {
    if (selectedTemplate) {
      return {
        title: applyTemplateVariables(
          selectedTemplate.titleTemplate || 'Notification',
          parsedTemplateVariables as Record<string, any>,
        ),
        body: applyTemplateVariables(
          selectedTemplate.bodyTemplate || '',
          parsedTemplateVariables as Record<string, any>,
        ),
      };
    }
    return {
      title: notificationTitle || 'Notification',
      body: notificationBody || 'Add a message to preview delivery.',
    };
  }, [selectedTemplate, parsedTemplateVariables, notificationTitle, notificationBody]);

  useEffect(() => {
    if (!selectedTemplate) return;
    const templateText = `${selectedTemplate.titleTemplate || ''} ${selectedTemplate.bodyTemplate || ''}`;
    const matches = Array.from(templateText.matchAll(/\{\{(\w+)\}\}/g));
    const keys = Array.from(new Set(matches.map((match) => match[1]))).filter(Boolean);
    if (keys.length === 0) {
      setTemplateVarPairs([]);
      return;
    }
    const defaults = selectedTemplate.metadata?.defaults || selectedTemplate.metadata?.variables || {};
    setTemplateVarPairs((prev) =>
      keys.map((key) => {
        const existing = prev.find((pair) => pair.key === key);
        return {
          key,
          value: existing?.value ?? String(defaults?.[key] ?? ''),
        };
      }),
    );
  }, [selectedTemplate]);

  const segments = useMemo(() => {
    const data = segmentsQuery.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    return [];
  }, [segmentsQuery.data]);

  const filteredSegments = useMemo(() => {
    if (!segmentSearch) {
      return segments;
    }
    const search = segmentSearch.toLowerCase();
    return (Array.isArray(segments) ? segments : []).filter((segment: any) =>
      String(segment.name || segment.id || '')
        .toLowerCase()
        .includes(search),
    );
  }, [segments, segmentSearch]);

  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    const profileTags = userProfile?.metadata?.tags || userProfile?.preferences?.tags;
    if (Array.isArray(profileTags)) {
      profileTags.forEach((tag: string) => tags.add(String(tag)));
    }
    routingRules.forEach((rule) => {
      (rule.conditions || []).forEach((condition: any) => {
        if (condition.field === 'tag') {
          tags.add(String(condition.value));
        }
      });
      (rule.groups || []).forEach((group: any) => {
        (group.conditions || []).forEach((condition: any) => {
          if (condition.field === 'tag') {
            tags.add(String(condition.value));
          }
        });
      });
    });
    return Array.from(tags).sort();
  }, [routingRules, userProfile]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) {
      return tagOptions;
    }
    const search = tagSearch.toLowerCase();
    return tagOptions.filter((tag) => tag.toLowerCase().includes(search));
  }, [tagOptions, tagSearch]);

  const segmentCounts = useMemo(() => {
    const stats = segmentStatsQuery.data || [];
    const list = Array.isArray(stats) ? stats : stats?.data || [];
    const map = new Map<string, number>();
    list.forEach((item: any) => {
      const key = item.segmentId || item.id || item.name;
      const count =
        item.count ??
        item.total ??
        item.customerCount ??
        item.members ??
        item.size ??
        item.totalCustomers;
      if (key) {
        map.set(String(key), Number(count ?? 0));
      }
    });
    return map;
  }, [segmentStatsQuery.data]);

  const getSegmentCount = (segment: string) =>
    segmentCounts.get(segment) ?? segmentCounts.get(String(segment)) ?? 0;

  const applyTemplateVariables = (template: string, variables: Record<string, any>) =>
    template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
      const value = variables?.[key];
      return value !== undefined && value !== null ? String(value) : '';
    });

  const getChipClass = (value: string) => {
    const palette = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-rose-50 text-rose-700 border-rose-200',
      'bg-slate-50 text-slate-700 border-slate-200',
    ];
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) % palette.length;
    }
    return palette[hash];
  };

  const FieldLabel = ({
    label,
    required,
    tooltip,
  }: {
    label: string;
    required?: boolean;
    tooltip?: string;
  }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span>{label}</span>
      {required && <span className="text-destructive">*</span>}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help rounded-full border px-1 text-[10px] text-muted-foreground">
              ?
            </span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  const providerHealth = useMemo(() => {
    const data = providerHealthQuery.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    return [];
  }, [providerHealthQuery.data]);

  const salesAlertPayload = {
    ...baseNotificationPayload,
    title: 'New Lead Assigned',
    body: 'You have a new lead ready for follow-up.',
    category: 'LEAD',
  };
  const weeklyDigestPayload = {
    ...baseNotificationPayload,
    title: 'Weekly Digest',
    body: 'Your activity summary is ready.',
    category: 'SYSTEM',
  };

  const handleRegister = () => {
    if (!deviceIdInput) {
      toast.error('Device ID is required');
      return;
    }
    const payload = {
      deviceId: deviceIdInput,
      deviceName: deviceNameInput || deviceIdInput || 'Mobile Device',
      platform: String(devicePlatformInput || 'ANDROID').toUpperCase(),
      pushToken: devicePushTokenInput || undefined,
    };
    registerMutation.mutate(payload);
  };

  const handleNotify = () => {
    if (!userId) {
      toast.error('User profile not loaded');
      return;
    }
    const channel = String(notificationChannel || messagingChannel || 'PUSH').toUpperCase();
    const phoneRequiredChannels = ['SMS', 'WHATSAPP', 'VOICE'];
    const toPhoneNumber = notificationToPhone || userPhoneNumber || undefined;
    if ((phoneRequiredChannels.includes(channel) || channel === 'HYBRID') && !toPhoneNumber) {
      toast.error('Add a phone number for SMS/WhatsApp/Voice delivery');
      return;
    }
    const payload = {
      userId,
      title: notificationTitle || 'Notification',
      body: notificationBody || '',
      category: notificationCategory || 'ALERT',
      channel,
      toPhoneNumber,
      scheduledFor: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
    };
    notifyMutation.mutate(payload);
  };

  const handleSaveMessagingSettings = () => {
    if (!organization?.id) {
      toast.error('Organization not loaded');
      return;
    }
    const defaultProvider =
      messagingChannel === 'WHATSAPP'
        ? whatsappProvider
        : messagingChannel === 'VOICE'
        ? voiceProvider
        : smsProvider;
    saveMessagingSettingsMutation.mutate({
      settings: {
        messaging: {
          channel: messagingChannel,
          fallbackChannel: messagingChannel === 'HYBRID' ? fallbackChannel : undefined,
          provider: defaultProvider,
          smsProvider,
          whatsappProvider,
          voiceProvider,
          quietHours:
            quietStart && quietEnd
              ? {
                  start: quietStart,
                  end: quietEnd,
                }
              : undefined,
          escalation: escalationMinutes
            ? [
                {
                  afterMinutes: Number(escalationMinutes),
                  channel: escalationChannel,
                  provider: escalationProvider,
                },
              ]
            : undefined,
          routingRules: routingRules.length ? routingRules : undefined,
          credentials: {
            twilio: twilioAccountSid || twilioAuthToken ? { accountSid: twilioAccountSid, authToken: twilioAuthToken } : undefined,
            vonage:
              vonageApiKey || vonageApiSecret || vonageApplicationId || vonagePrivateKey
                ? {
                    apiKey: vonageApiKey,
                    apiSecret: vonageApiSecret,
                    applicationId: vonageApplicationId,
                    privateKey: vonagePrivateKey,
                  }
                : undefined,
            messagebird: messageBirdAccessKey ? { accessKey: messageBirdAccessKey } : undefined,
          },
          fromNumbers: {
            sms: smsFrom || undefined,
            whatsapp: whatsappFrom || undefined,
            voice: voiceFrom || undefined,
          },
        },
      },
    });
  };

  const handleSavePhoneNumber = () => {
    if (!userId) {
      toast.error('User profile not loaded');
      return;
    }
    updatePhoneMutation.mutate({ phoneNumber: userPhoneNumber || null });
  };

  const handleSaveRouting = () => {
    if (!userId) {
      toast.error('User profile not loaded');
      return;
    }
    updateRoutingMutation.mutate({
      preferences: {
        notificationRouting: {
          preferredChannel: routingChannel,
          provider: routingProvider,
        },
        segment: userSegment || undefined,
        vip: userVip === 'YES',
      },
    });
  };

  const handleRequestOtp = () => {
    if (!userPhoneNumber) {
      toast.error('Enter a phone number');
      return;
    }
    otpRequestMutation.mutate(userPhoneNumber);
  };

  const handleVerifyOtp = () => {
    if (!userPhoneNumber || !otpCode) {
      toast.error('Enter phone number and OTP');
      return;
    }
    otpVerifyMutation.mutate({ phone: userPhoneNumber, otp: otpCode });
  };

  const handleCreateTemplate = () => {
    createTemplateMutation.mutate({
      name: templateName,
      locale: templateLocale,
      channel: templateChannel,
      titleTemplate: templateTitle,
      bodyTemplate: templateBody,
    });
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplateId) {
      toast.error('Select a template to edit');
      return;
    }
    updateTemplateMutation.mutate({
      id: editingTemplateId,
      data: {
        name: templateName,
        locale: templateLocale,
        channel: templateChannel,
        titleTemplate: templateTitle,
        bodyTemplate: templateBody,
      },
    });
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplateId(template.id);
    setSelectedTemplateId(template.id);
    setTemplateName(template.name || '');
    setTemplateLocale(template.locale || 'en-US');
    setTemplateChannel(template.channel || 'PUSH');
    setTemplateTitle(template.titleTemplate || '');
    setTemplateBody(template.bodyTemplate || '');
  };

  const handleCancelEditTemplate = () => {
    setEditingTemplateId(null);
    setTemplateName('');
    setTemplateLocale('en-US');
    setTemplateChannel('PUSH');
    setTemplateTitle('Hello {{name}}');
    setTemplateBody('Your update is ready, {{name}}.');
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplateMutation.mutate(id);
  };

  const handleSendTemplate = () => {
    if (!selectedTemplateId) {
      toast.error('Select a template');
      return;
    }
    if (!userId) {
      toast.error('User profile not loaded');
      return;
    }
    const variables = parsedTemplateVariables || {};
    const payload = {
      userId,
      templateId: selectedTemplateId,
      templateVariables: variables,
      category: 'ALERT',
      channel: messagingChannel,
      toPhoneNumber: userPhoneNumber || undefined,
      scheduledFor: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
    };
    notifyMutation.mutate(payload);
  };

  const handleApplySchedule = () => {
    if (!scheduleAt) {
      toast.error('Select a schedule time');
      return;
    }
    toast.success('Schedule applied to the next send');
  };

  const handlePairDevice = () => {
    if (!devicePairId || !devicePairOtp) {
      toast.error('Enter device ID and OTP');
      return;
    }
    pairDeviceMutation.mutate({ deviceId: devicePairId, otp: devicePairOtp });
  };

  const handleResolveConflict = (syncId: string, resolveWith: string) => {
    if (resolveWith === 'merged') {
      const mergedPayload = mergedConflictPayloads[syncId] || '';
      if (!mergedPayload) {
        toast.error('Provide merged payload JSON');
        return;
      }
      try {
        const mergedData = JSON.parse(mergedPayload);
        resolveConflictMutation.mutate({ syncId, resolveWith, mergedData });
      } catch (error) {
        toast.error('Merged payload must be valid JSON');
      }
      return;
    }
    resolveConflictMutation.mutate({ syncId, resolveWith });
  };

  const handleAddRoutingRule = () => {
    const groups = ruleGroups.length
      ? ruleGroups
      : ruleConditions.length
      ? [{ operator: groupOperator, conditions: ruleConditions }]
      : [];
    if (groups.length === 0) {
      toast.error('Add at least one condition group');
      return;
    }

    const next = [
      ...routingRules,
      {
        name: ruleName || `Rule ${routingRules.length + 1}`,
        operator: ruleOperator,
        groups,
        channel: ruleChannel,
        provider: ruleProvider,
      },
    ];

    setRoutingRules(next);
    setRuleName('');
    setRuleOperator('AND');
    setRuleConditions([]);
    setRuleGroups([]);
  };

  const handleRemoveRoutingRule = (index: number) => {
    setRoutingRules((prev) => prev.filter((_: any, idx: number) => idx !== index));
  };

  const handleAddCondition = () => {
    if (!conditionField) {
      return;
    }
    if (conditionField === 'segment' && selectedSegments.length > 0) {
      setRuleConditions((prev) => [
        ...prev,
        ...selectedSegments.map((segment) => ({ field: 'segment', value: segment })),
      ]);
      setSelectedSegments([]);
      setSegmentSearch('');
      setConditionValue('');
      return;
    }
    if (conditionField === 'tag' && selectedTags.length > 0) {
      setRuleConditions((prev) => [
        ...prev,
        ...selectedTags.map((tag) => ({ field: 'tag', value: tag })),
      ]);
      setSelectedTags([]);
      setTagSearch('');
      return;
    }
    if (!conditionValue) {
      toast.error('Condition value is required');
      return;
    }
    setRuleConditions((prev) => [
      ...prev,
      { field: conditionField, value: conditionValue },
    ]);
    setConditionValue('');
    if (conditionField === 'tag') {
      setTagSearch('');
      setSelectedTags([]);
    }
    if (conditionField === 'segment') {
      setSegmentSearch('');
      setSelectedSegments([]);
    }
  };

  const handleRemoveCondition = (index: number) => {
    setRuleConditions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddGroup = () => {
    if (ruleConditions.length === 0) {
      toast.error('Add at least one condition to the group');
      return;
    }
    setRuleGroups((prev) => [
      ...prev,
      { operator: groupOperator, conditions: ruleConditions },
    ]);
    setRuleConditions([]);
    setGroupOperator('AND');
    setSelectedTags([]);
    setTagSearch('');
    setSelectedSegments([]);
    setSegmentSearch('');
  };

  const handleRemoveGroup = (index: number) => {
    setRuleGroups((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveRoutingRule = (index: number, direction: number) => {
    setRoutingRules((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) {
        return prev;
      }
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const handleDragStart = (index: number) => {
    setDragRuleIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragRuleIndex === null || dragRuleIndex === index) {
      setDragRuleIndex(null);
      setDragOverIndex(null);
      return;
    }
    setRoutingRules((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragRuleIndex, 1);
      next.splice(index, 0, item);
      return next;
    });
    setDragRuleIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragRuleIndex(null);
    setDragOverIndex(null);
  };

  const handleAddTag = (tag: string) => {
    if (!tag) return;
    setSelectedTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleAddSegment = (segment: string) => {
    if (!segment) return;
    setSelectedSegments((prev) => (prev.includes(segment) ? prev : [...prev, segment]));
  };

  const handleRemoveSegment = (segment: string) => {
    setSelectedSegments((prev) => prev.filter((item) => item !== segment));
  };

  const handleAddTemplateVariable = () => {
    if (!templateVarKey) return;
    setTemplateVarPairs((prev) => {
      const existingIndex = prev.findIndex((pair) => pair.key === templateVarKey);
      const next = [...prev];
      if (existingIndex >= 0) {
        next[existingIndex] = { key: templateVarKey, value: templateVarValue };
      } else {
        next.push({ key: templateVarKey, value: templateVarValue });
      }
      return next;
    });
    setTemplateVarKey('');
    setTemplateVarValue('');
  };

  const handleRemoveTemplateVariable = (key: string) => {
    setTemplateVarPairs((prev) => prev.filter((pair) => pair.key !== key));
  };

  const isDeviceIdMissing = !deviceIdInput.trim();
  const isNotificationTitleMissing = !notificationTitle.trim();
  const isNotificationBodyMissing = !notificationBody.trim();
  const isTemplateNameMissing = !templateName.trim();
  const isTemplateTitleMissing = !templateTitle.trim();
  const isTemplateBodyMissing = !templateBody.trim();

  const getDeliveryBadgeClass = (status?: string) => {
    const normalized = String(status || '').toUpperCase();
    if (normalized.includes('FAILED') || normalized.includes('ERROR')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (normalized.includes('QUEUED') || normalized.includes('PENDING')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (normalized.includes('DELIVERED') || normalized.includes('SENT')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="rounded-2xl border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/70">
          <Badge className="bg-white/10 text-white" variant="outline">
            Mobile Hub
          </Badge>
          <Badge className="bg-white/10 text-white" variant="outline">
            Push Notifications
          </Badge>
          <Badge className="bg-white/10 text-white" variant="outline">
            Sync Intelligence
          </Badge>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Mobile Service Command Center</h1>
          <p className="max-w-2xl text-sm text-white/70">
            Monitor device registrations, orchestrate notifications, and keep sync health pristine
            across your mobile fleet.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
          <span>
            Devices: <span className="font-semibold text-white">{devices.length}</span>
          </span>
          <span>
            Notifications: <span className="font-semibold text-white">{notifications.length}</span>
          </span>
          <span>
            Last Sync:{' '}
            <span className="font-semibold text-white">{lastSyncAt ? String(lastSyncAt) : '—'}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">
              {devicesQuery.isLoading ? '—' : devices.length.toLocaleString()}
            </div>
            <Badge variant={devicesQuery.isError ? 'destructive' : 'secondary'}>
              {devicesQuery.isError ? 'Error loading devices' : 'Registry healthy'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">
              {notificationsQuery.isLoading ? '—' : notifications.length.toLocaleString()}
            </div>
            <Badge variant={notificationsQuery.isError ? 'destructive' : 'secondary'}>
              {notificationsQuery.isError ? 'Delivery feed paused' : 'Delivery stream live'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Sync Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-semibold">
              {statsQuery.isLoading ? '—' : Number(successSyncs).toLocaleString()}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Pending: {Number(pendingSyncs).toLocaleString()}</span>
              <span>Failed: {Number(failedSyncs).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-5 md:gap-0">
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="providers">Provider Health</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Device Registry</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {devicesQuery.isLoading
                    ? 'Fetching registered devices...'
                    : `${devices.length.toLocaleString()} devices ready for mobile engagement.`}
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <div className="text-sm font-medium text-muted-foreground">Device Health Snapshot</div>
                  <div className="mt-2 space-y-2">
                    {devicesQuery.isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-5 w-4/6" />
                      </div>
                    ) : devices.length === 0 ? (
                      <div>No devices registered yet.</div>
                    ) : (
                      devices.slice(0, 5).map((device: any) => (
                        <div key={device.id} className="flex flex-wrap gap-3">
                          <span className="font-semibold">{device.deviceName || device.deviceId}</span>
                          <span>{device.platform}</span>
                          <span>Last seen: {device.lastSeen ? String(device.lastSeen) : '—'}</span>
                          <span>Battery: {device.batteryLevel ?? '—'}%</span>
                          <span>Token: {device.pushToken ? '✅' : '❌'}</span>
                          <span>Token Expiry: {device.pushTokenExpiresAt ? String(device.pushTokenExpiresAt) : '—'}</span>
                          <span>OS: {device.platformVersion || '—'}</span>
                          <span>App: {device.appVersion || '—'}</span>
                          <span>Trusted: {device.isTrusted ? 'Yes' : 'No'}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <FieldLabel label="Device ID" required tooltip="Unique ID from the mobile app." />
                    <Input
                      placeholder="device-1"
                      value={devicePairId}
                      onChange={(event) => setDevicePairId(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="OTP" tooltip="Pairing OTP from the device." />
                    <Input
                      placeholder="123456"
                      value={devicePairOtp}
                      onChange={(event) => setDevicePairOtp(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handlePairDevice} disabled={pairDeviceMutation.isPending}>
                      {pairDeviceMutation.isPending ? 'Pairing...' : 'Pair Device'}
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Device ID" required tooltip="Unique device identifier." />
                    <Input
                      placeholder="device-1"
                      value={deviceIdInput}
                      onChange={(event) => setDeviceIdInput(event.target.value)}
                      aria-invalid={isDeviceIdMissing}
                    />
                    {isDeviceIdMissing && (
                      <p className="text-xs text-destructive">Device ID is required.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Device Name" tooltip="Friendly name shown in the registry." />
                    <Input
                      placeholder="Pixel 9 Pro"
                      value={deviceNameInput}
                      onChange={(event) => setDeviceNameInput(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Platform" required tooltip="Android or iOS device type." />
                    <Select value={devicePlatformInput} onValueChange={setDevicePlatformInput}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANDROID">Android</SelectItem>
                        <SelectItem value="IOS">iOS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Push Token" tooltip="Push token from the device." />
                    <Input
                      placeholder="expo-push-token"
                      value={devicePushTokenInput}
                      onChange={(event) => setDevicePushTokenInput(event.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleRegister} disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? 'Registering...' : 'Register Device'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeviceIdInput(androidSamplePayload.deviceId);
                      setDeviceNameInput(androidSamplePayload.deviceName);
                      setDevicePlatformInput(androidSamplePayload.platform);
                      setDevicePushTokenInput(androidSamplePayload.pushToken);
                      registerMutation.mutate(androidSamplePayload);
                    }}
                    disabled={registerMutation.isPending}
                  >
                    Android Sample
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeviceIdInput(iosSamplePayload.deviceId);
                      setDeviceNameInput(iosSamplePayload.deviceName);
                      setDevicePlatformInput(iosSamplePayload.platform);
                      setDevicePushTokenInput(iosSamplePayload.pushToken);
                      registerMutation.mutate(iosSamplePayload);
                    }}
                    disabled={registerMutation.isPending}
                  >
                    iOS Sample
                  </Button>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <div className="text-sm font-medium text-muted-foreground">Recent Devices</div>
                  {devicesQuery.isLoading ? (
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                      <Skeleton className="h-6 w-4/6" />
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="mt-2 text-muted-foreground">No devices yet.</div>
                  ) : (
                    <div className="mt-2 rounded-md border bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Last Seen</TableHead>
                            <TableHead>Battery</TableHead>
                            <TableHead>Token</TableHead>
                            <TableHead>Trusted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {devices.slice(0, 8).map((device: any) => (
                            <TableRow key={device.id}>
                              <TableCell className="font-medium">
                                {device.deviceName || device.deviceId}
                              </TableCell>
                              <TableCell>{device.platform}</TableCell>
                              <TableCell>{device.lastSeen ? String(device.lastSeen) : '—'}</TableCell>
                              <TableCell>{device.batteryLevel ?? '—'}%</TableCell>
                              <TableCell>{device.pushToken ? '✅' : '❌'}</TableCell>
                              <TableCell>{device.isTrusted ? 'Yes' : 'No'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Sync Telemetry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">Synced Records</div>
                    <div className="text-2xl font-semibold">
                      {statsQuery.isLoading ? '—' : Number(successSyncs).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">Pending Queue</div>
                    <div className="text-2xl font-semibold">
                      {statsQuery.isLoading ? '—' : Number(pendingSyncs).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="text-xs text-muted-foreground">Failed Attempts</div>
                    <div className="text-2xl font-semibold">
                      {statsQuery.isLoading ? '—' : Number(failedSyncs).toLocaleString()}
                    </div>
                  </div>
                </div>
                <details className="mt-4 rounded-lg border bg-muted/30 p-3 text-xs">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    View raw sync statistics
                  </summary>
                  <pre className="mt-2 overflow-auto">
                    {statsQuery.isLoading ? 'Loading...' : JSON.stringify(statsQuery.data ?? {}, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Offline Sync Conflicts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conflictsQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
              ) : (conflictsQuery.data || []).length === 0 ? (
                <div className="text-sm text-muted-foreground">No conflicts detected.</div>
              ) : (
                (conflictsQuery.data || []).map((conflict: any) => (
                  <div key={conflict.id} className="rounded-lg border bg-muted/20 p-4 space-y-3">
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="font-medium">{conflict.entityType}</span>
                      <span>ID: {conflict.entityId}</span>
                      <span>Status: {conflict.status}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fields: {conflict.conflictData?.conflictFields?.join(', ') || '—'}
                    </div>
                    <Textarea
                      placeholder="Merged payload JSON"
                      value={mergedConflictPayloads[conflict.id] || ''}
                      onChange={(event) =>
                        setMergedConflictPayloads((prev) => ({
                          ...prev,
                          [conflict.id]: event.target.value,
                        }))
                      }
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict.id, 'server')}
                        disabled={resolveConflictMutation.isPending}
                      >
                        Keep Server
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleResolveConflict(conflict.id, 'client')}
                        disabled={resolveConflictMutation.isPending}
                      >
                        Keep Client
                      </Button>
                      <Button
                        onClick={() => handleResolveConflict(conflict.id, 'merged')}
                        disabled={resolveConflictMutation.isPending}
                      >
                        Merge
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Notification Studio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                  {notificationsQuery.isLoading
                    ? 'Fetching notification activity...'
                    : `${notifications.length.toLocaleString()} notifications sent in this workspace.`}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Title" required tooltip="Required for push and templates." />
                    <Input
                      placeholder="Hello"
                      value={notificationTitle}
                      onChange={(event) => setNotificationTitle(event.target.value)}
                      aria-invalid={isNotificationTitleMissing}
                    />
                    {isNotificationTitleMissing && (
                      <p className="text-xs text-destructive">Title is required.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Category" tooltip="Optional category for reporting." />
                    <Input
                      placeholder="ALERT"
                      value={notificationCategory}
                      onChange={(event) => setNotificationCategory(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <FieldLabel label="Body" required tooltip="Message content delivered to users." />
                    <Textarea
                      value={notificationBody}
                      onChange={(event) => setNotificationBody(event.target.value)}
                      rows={3}
                      aria-invalid={isNotificationBodyMissing}
                    />
                    {isNotificationBodyMissing && (
                      <p className="text-xs text-destructive">Body is required.</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Channel" required tooltip="Push, SMS, WhatsApp, Voice, or Hybrid." />
                    <Select value={notificationChannel} onValueChange={setNotificationChannel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUSH">Push</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="VOICE">Voice</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="To Phone" tooltip="Required for SMS/WhatsApp/Voice." />
                    <Input
                      placeholder="+15551234567"
                      value={notificationToPhone}
                      onChange={(event) => setNotificationToPhone(event.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Schedule For" tooltip="Optional future delivery time." />
                    <Input
                      type="datetime-local"
                      value={scheduleAt}
                      onChange={(event) => setScheduleAt(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={handleApplySchedule}>
                      Apply Schedule
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Template" tooltip="Use a template for dynamic content." />
                    <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {(templatesQuery.data || []).map((template: any) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.locale})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Template Variables" tooltip="Add key/value variables." />
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input
                        placeholder="key"
                        value={templateVarKey}
                        onChange={(event) => setTemplateVarKey(event.target.value)}
                      />
                      <Input
                        placeholder="value"
                        value={templateVarValue}
                        onChange={(event) => setTemplateVarValue(event.target.value)}
                      />
                      <Button variant="outline" onClick={handleAddTemplateVariable}>
                        Add Variable
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {templateVarPairs.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No variables yet.</span>
                      ) : (
                        templateVarPairs.map((pair) => (
                          <span
                            key={pair.key}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass(
                              pair.key
                            )}`}
                          >
                            {pair.key}: {pair.value}
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleRemoveTemplateVariable(pair.key)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleNotify} disabled={notifyMutation.isPending}>
                    {notifyMutation.isPending ? 'Sending...' : 'Send Notification'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSendTemplate}
                    disabled={notifyMutation.isPending}
                  >
                    Send Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!userId) {
                        toast.error('User profile not loaded');
                        return;
                      }
                      setNotificationTitle(salesAlertPayload.title);
                      setNotificationBody(salesAlertPayload.body);
                      setNotificationCategory(salesAlertPayload.category);
                      setNotificationChannel(salesAlertPayload.channel);
                      notifyMutation.mutate(salesAlertPayload);
                    }}
                    disabled={notifyMutation.isPending}
                  >
                    Sales Alert
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!userId) {
                        toast.error('User profile not loaded');
                        return;
                      }
                      setNotificationTitle(weeklyDigestPayload.title);
                      setNotificationBody(weeklyDigestPayload.body);
                      setNotificationCategory(weeklyDigestPayload.category);
                      setNotificationChannel(weeklyDigestPayload.channel);
                      notifyMutation.mutate(weeklyDigestPayload);
                    }}
                    disabled={notifyMutation.isPending}
                  >
                    Weekly Digest
                  </Button>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <div className="text-sm font-medium text-muted-foreground">Recent Notifications</div>
                  {notificationsQuery.isLoading ? (
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-5/6" />
                      <Skeleton className="h-6 w-4/6" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="mt-2 text-muted-foreground">No notifications yet.</div>
                  ) : (
                    <div className="mt-2 rounded-md border bg-background">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Channel</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {notifications.slice(0, 8).map((notification: any) => (
                            <TableRow key={notification.id || notification.createdAt}>
                              <TableCell className="font-medium">
                                {notification.title || notification.body || 'Notification'}
                              </TableCell>
                              <TableCell>{notification.channel || 'PUSH'}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={getDeliveryBadgeClass(notification.status)}>
                                  {notification.status || 'SENT'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {notification.sentAt || notification.createdAt
                                  ? String(notification.sentAt || notification.createdAt)
                                  : '—'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  Preview the notification as it appears on a phone.
                </div>
                <div className="mx-auto flex w-full max-w-[280px] flex-col rounded-[28px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-inner">
                  <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-slate-300" />
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="text-xs text-muted-foreground">CognexiaAI</div>
                    <div className="mt-2 text-sm font-semibold">{notificationPreview.title}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{notificationPreview.body}</div>
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] text-muted-foreground">
                    <span>{notificationChannel}</span>
                    <span>{scheduleAt ? 'Scheduled' : 'Instant'}</span>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                  <div className="font-medium text-muted-foreground">Delivery Summary</div>
                  <div className="mt-2 flex flex-col gap-1">
                    <span>Channel: {notificationChannel}</span>
                    <span>Recipient: {notificationToPhone || userPhoneNumber || '—'}</span>
                    <span>Schedule: {scheduleAt || 'Now'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel label="Template Name" required tooltip="Internal name for the template." />
                  <Input
                    placeholder="Lead follow-up"
                    value={templateName}
                    onChange={(event) => setTemplateName(event.target.value)}
                    aria-invalid={isTemplateNameMissing}
                  />
                  {isTemplateNameMissing && (
                    <p className="text-xs text-destructive">Template name is required.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <FieldLabel label="Locale" tooltip="Example: en-US" />
                  <Input
                    placeholder="en-US"
                    value={templateLocale}
                    onChange={(event) => setTemplateLocale(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel label="Channel" required tooltip="Where the template is used." />
                  <Select value={templateChannel} onValueChange={setTemplateChannel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Channel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUSH">Push</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="VOICE">Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel label="Title Template" required tooltip="Use {{variable}} placeholders." />
                <Input
                  value={templateTitle}
                  onChange={(event) => setTemplateTitle(event.target.value)}
                  aria-invalid={isTemplateTitleMissing}
                />
                {isTemplateTitleMissing && (
                  <p className="text-xs text-destructive">Title template is required.</p>
                )}
              </div>
              <div className="space-y-2">
                <FieldLabel label="Body Template" required tooltip="Use {{variable}} placeholders." />
                <Textarea
                  value={templateBody}
                  onChange={(event) => setTemplateBody(event.target.value)}
                  rows={3}
                  aria-invalid={isTemplateBodyMissing}
                />
                {isTemplateBodyMissing && (
                  <p className="text-xs text-destructive">Body template is required.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={editingTemplateId ? handleUpdateTemplate : handleCreateTemplate}
                  disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                >
                  {createTemplateMutation.isPending || updateTemplateMutation.isPending
                    ? 'Saving...'
                    : editingTemplateId
                    ? 'Save Changes'
                    : 'Create Template'}
                </Button>
                {editingTemplateId && (
                  <Button variant="outline" onClick={handleCancelEditTemplate}>
                    Cancel Edit
                  </Button>
                )}
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                {templatesQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(templatesQuery.data || []).length === 0 && <div>No templates yet.</div>}
                    {(templatesQuery.data || []).map((template: any) => (
                      <div key={template.id} className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-muted-foreground">
                            {template.locale} • {template.channel || 'PUSH'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTemplateId(template.id)}
                          >
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTemplate(template)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                            disabled={deleteTemplateMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-lg border bg-muted/20 p-3 text-xs">
                <div className="text-sm font-medium text-muted-foreground">Template Preview</div>
                {!selectedTemplate ? (
                  <div className="mt-2 text-muted-foreground">Select a template to preview.</div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-muted-foreground">Title</div>
                      <div className="font-medium">
                        {applyTemplateVariables(
                          selectedTemplate.titleTemplate || '',
                          parsedTemplateVariables as Record<string, any>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Body</div>
                      <div>
                        {applyTemplateVariables(
                          selectedTemplate.bodyTemplate || '',
                          parsedTemplateVariables as Record<string, any>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Provider Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Monitor provider status and automatic failover readiness.
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                {providerHealthQuery.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                  </div>
                ) : providerHealth.length === 0 ? (
                  'No provider health records yet.'
                ) : (
                  <div className="rounded-md border bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Provider</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Failures</TableHead>
                          <TableHead>Latency (ms)</TableHead>
                          <TableHead>Last Error</TableHead>
                          <TableHead>Last Checked</TableHead>
                          <TableHead>Created By</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {providerHealth.map((item: any) => (
                          <TableRow key={`${item.provider}-${item.channel}-${item.id || ''}`}>
                            <TableCell className="font-medium">{item.provider}</TableCell>
                            <TableCell>{item.channel}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  item.status === 'HEALTHY'
                                    ? 'secondary'
                                    : item.status === 'DEGRADED'
                                    ? 'outline'
                                    : 'destructive'
                                }
                              >
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{Number(item.failureCount ?? 0)}</TableCell>
                            <TableCell>{Number(item.latencyMs ?? 0) || '—'}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {item.lastError || '—'}
                            </TableCell>
                            <TableCell>{item.lastCheckedAt ? String(item.lastCheckedAt) : '—'}</TableCell>
                            <TableCell>{item.createdByName || 'System'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              <Button
                onClick={() => refreshProviderHealthMutation.mutate()}
                disabled={refreshProviderHealthMutation.isPending}
              >
                {refreshProviderHealthMutation.isPending ? 'Refreshing...' : 'Refresh Health'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Messaging Providers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Primary Channel" required tooltip="Default channel for delivery." />
                    <Select value={messagingChannel} onValueChange={setMessagingChannel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUSH">Push</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="VOICE">Voice</SelectItem>
                        <SelectItem value="HYBRID">Hybrid (Push + fallback)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel label="Fallback Channel" tooltip="Used when hybrid is enabled." />
                    <Select
                      value={fallbackChannel}
                      onValueChange={setFallbackChannel}
                      disabled={messagingChannel !== 'HYBRID'}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select fallback" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="VOICE">Voice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <FieldLabel label="SMS Provider" tooltip="Select SMS provider." />
                    <Select value={smsProvider} onValueChange={setSmsProvider}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TWILIO">Twilio</SelectItem>
                        <SelectItem value="VONAGE">Vonage</SelectItem>
                        <SelectItem value="MESSAGEBIRD">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="WhatsApp Provider" tooltip="Select WhatsApp provider." />
                    <Select value={whatsappProvider} onValueChange={setWhatsappProvider}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TWILIO">Twilio</SelectItem>
                        <SelectItem value="VONAGE">Vonage</SelectItem>
                        <SelectItem value="MESSAGEBIRD">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Voice Provider" tooltip="Select voice provider." />
                    <Select value={voiceProvider} onValueChange={setVoiceProvider}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TWILIO">Twilio</SelectItem>
                        <SelectItem value="VONAGE">Vonage</SelectItem>
                        <SelectItem value="MESSAGEBIRD">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <FieldLabel label="SMS From" tooltip="Sender ID or phone number." />
                    <Input
                      placeholder="+15551234567"
                      value={smsFrom}
                      onChange={(event) => setSmsFrom(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="WhatsApp From" tooltip="Phone or channel ID." />
                    <Input
                      placeholder="+15551234567 or MessageBird channel ID"
                      value={whatsappFrom}
                      onChange={(event) => setWhatsappFrom(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Voice From" tooltip="Caller ID number." />
                    <Input
                      placeholder="+15551234567"
                      value={voiceFrom}
                      onChange={(event) => setVoiceFrom(event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Quiet Hours Start" tooltip="Start time for quiet hours." />
                    <Input
                      placeholder="22:00"
                      value={quietStart}
                      onChange={(event) => setQuietStart(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Quiet Hours End" tooltip="End time for quiet hours." />
                    <Input
                      placeholder="07:00"
                      value={quietEnd}
                      onChange={(event) => setQuietEnd(event.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <FieldLabel label="Escalate After (minutes)" tooltip="Minutes before escalation." />
                    <Input
                      placeholder="15"
                      value={escalationMinutes}
                      onChange={(event) => setEscalationMinutes(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Escalation Channel" tooltip="Channel to use on escalation." />
                    <Select value={escalationChannel} onValueChange={setEscalationChannel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="VOICE">Voice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Escalation Provider" tooltip="Provider for escalation." />
                    <Select value={escalationProvider} onValueChange={setEscalationProvider}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TWILIO">Twilio</SelectItem>
                        <SelectItem value="VONAGE">Vonage</SelectItem>
                        <SelectItem value="MESSAGEBIRD">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <details className="rounded-lg border bg-muted/30 p-3 text-xs">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Provider credentials
                  </summary>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <FieldLabel label="Twilio Account SID" />
                      <Input
                        type="password"
                        value={twilioAccountSid}
                        onChange={(event) => setTwilioAccountSid(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Twilio Auth Token" />
                      <Input
                        type="password"
                        value={twilioAuthToken}
                        onChange={(event) => setTwilioAuthToken(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Vonage API Key" />
                      <Input
                        type="password"
                        value={vonageApiKey}
                        onChange={(event) => setVonageApiKey(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Vonage API Secret" />
                      <Input
                        type="password"
                        value={vonageApiSecret}
                        onChange={(event) => setVonageApiSecret(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="Vonage Application ID" />
                      <Input
                        type="password"
                        value={vonageApplicationId}
                        onChange={(event) => setVonageApplicationId(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <FieldLabel label="MessageBird Access Key" />
                      <Input
                        type="password"
                        value={messageBirdAccessKey}
                        onChange={(event) => setMessageBirdAccessKey(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <FieldLabel label="Vonage Private Key" />
                      <Textarea
                        value={vonagePrivateKey}
                        onChange={(event) => setVonagePrivateKey(event.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </details>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Provider keys are read from backend environment variables. Set the channel here to control the
                    delivery route.
                  </span>
                </div>

                <Button
                  onClick={handleSaveMessagingSettings}
                  disabled={saveMessagingSettingsMutation.isPending || !organization?.id}
                >
                  {saveMessagingSettingsMutation.isPending ? 'Saving...' : 'Save Messaging Settings'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Mobile Number Connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs text-muted-foreground">
                  Save a verified mobile number for SMS/WhatsApp/Voice delivery. This number is used when
                  no device push token is available.
                </div>
                <div className="space-y-2">
                  <FieldLabel label="Recipient Phone Number" required tooltip="Used for SMS/WhatsApp/Voice." />
                  <Input
                    placeholder="+15551234567"
                    value={userPhoneNumber}
                    onChange={(event) => setUserPhoneNumber(event.target.value)}
                  />
                </div>
                <Button
                  onClick={handleSavePhoneNumber}
                  disabled={updatePhoneMutation.isPending || !userId}
                >
                  {updatePhoneMutation.isPending ? 'Saving...' : 'Save Phone Number'}
                </Button>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="OTP Code" tooltip="Enter OTP sent to the phone." />
                    <Input
                      placeholder="123456"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRequestOtp}
                      disabled={otpRequestMutation.isPending}
                    >
                      {otpRequestMutation.isPending ? 'Sending...' : 'Send OTP'}
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otpVerifyMutation.isPending}
                    >
                      {otpVerifyMutation.isPending ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="Preferred Channel" tooltip="User preference for delivery." />
                    <Select value={routingChannel} onValueChange={setRoutingChannel}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PUSH">Push</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="VOICE">Voice</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="Preferred Provider" tooltip="User provider preference." />
                    <Select value={routingProvider} onValueChange={setRoutingProvider}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TWILIO">Twilio</SelectItem>
                        <SelectItem value="VONAGE">Vonage</SelectItem>
                        <SelectItem value="MESSAGEBIRD">MessageBird</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel label="User Segment" tooltip="Segment name for routing." />
                    <Input
                      placeholder="enterprise"
                      value={userSegment}
                      onChange={(event) => setUserSegment(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel label="VIP" tooltip="Flag for VIP routing." />
                    <Select value={userVip} onValueChange={setUserVip}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="VIP" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YES">Yes</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSaveRouting}
                  disabled={updateRoutingMutation.isPending || !userId}
                >
                  {updateRoutingMutation.isPending ? 'Saving...' : 'Save Routing Preferences'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Routing Rules (Segment / VIP)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Name</label>
                <Input
                  placeholder="VIP WhatsApp"
                  value={ruleName}
                  onChange={(event) => setRuleName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Operator</label>
                <Select value={ruleOperator} onValueChange={setRuleOperator}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Condition Field</label>
                <Select value={conditionField} onValueChange={setConditionField}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segment">Segment</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="userType">User Type</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="tag">Tag</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Condition Value</label>
                {conditionField === 'segment' ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search segments"
                      value={segmentSearch}
                      onChange={(event) => setSegmentSearch(event.target.value)}
                    />
                    {selectedSegments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSegments.map((segment) => (
                          <span
                            key={segment}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass(segment)}`}
                          >
                            {segment}
                            <span className="text-muted-foreground">
                              ({getSegmentCount(segment)})
                            </span>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleRemoveSegment(segment)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : conditionValue ? (
                      <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                        <span>{conditionValue}</span>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setConditionValue('')}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}
                    <div className="max-h-32 overflow-auto rounded-md border bg-muted/20 p-2 text-xs">
                      {filteredSegments.length === 0 ? (
                        <div className="text-muted-foreground">No segments found.</div>
                      ) : (
                        filteredSegments.map((segment: any) => (
                          <button
                            key={segment.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded px-2 py-1 text-left hover:bg-muted"
                            onClick={() => {
                              handleAddSegment(String(segment.name || segment.id));
                              setConditionValue(String(segment.name || segment.id));
                            }}
                          >
                            <span>{segment.name || segment.id}</span>
                            <span className="text-muted-foreground">
                              {getSegmentCount(String(segment.name || segment.id)).toLocaleString()}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddSegment(conditionValue || segmentSearch)}
                    >
                      Add Segment
                    </Button>
                  </div>
                ) : conditionField === 'vip' ? (
                  <Select value={conditionValue} onValueChange={setConditionValue}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="VIP" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : conditionField === 'userType' ? (
                  <Select value={conditionValue} onValueChange={setConditionValue}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="User Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="org_admin">Org Admin</SelectItem>
                      <SelectItem value="org_user">Org User</SelectItem>
                    </SelectContent>
                  </Select>
                ) : conditionField === 'tag' ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Search tags or enter new"
                      value={tagSearch}
                      onChange={(event) => {
                        setTagSearch(event.target.value);
                        setConditionValue(event.target.value);
                      }}
                    />
                    {selectedTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass(tag)}`}
                          >
                            {tag}
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="max-h-32 overflow-auto rounded-md border bg-muted/20 p-2 text-xs">
                      {filteredTags.length === 0 ? (
                        <div className="text-muted-foreground">No tag suggestions.</div>
                      ) : (
                        filteredTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            className="block w-full rounded px-2 py-1 text-left hover:bg-muted"
                            onClick={() => {
                              handleAddTag(tag);
                              setConditionValue(tag);
                              setTagSearch(tag);
                            }}
                          >
                            {tag}
                          </button>
                        ))
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTag(conditionValue || tagSearch)}
                    >
                      Add Tag
                    </Button>
                  </div>
                ) : (
                  <Input
                    placeholder="value"
                    value={conditionValue}
                    onChange={(event) => setConditionValue(event.target.value)}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleAddCondition}>
                Add Condition
              </Button>
              <Select value={groupOperator} onValueChange={setGroupOperator}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleAddGroup}>
                Add Group
              </Button>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
              {ruleConditions.length === 0 ? (
                <div className="text-muted-foreground">No pending conditions.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ruleConditions.map((condition, index) => (
                    <span
                      key={`${condition.field}-${index}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass(
                        `${condition.field}-${condition.value}`
                      )}`}
                    >
                      <span className="font-medium">{condition.field}</span>: {String(condition.value)}
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveCondition(index)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-muted/20 p-3 text-xs">
              {ruleGroups.length === 0 ? (
                <div className="text-muted-foreground">No groups added.</div>
              ) : (
                <div className="space-y-2">
                  {ruleGroups.map((group, index) => (
                    <div key={`group-${index}`} className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">Group {index + 1} ({group.operator})</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(group.conditions || []).map((condition, conditionIndex) => (
                            <span
                              key={`${condition.field}-${conditionIndex}`}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass(
                                `${condition.field}-${condition.value}`
                              )}`}
                            >
                              <span className="font-medium">{condition.field}</span>: {String(condition.value)}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleRemoveGroup(index)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Channel</label>
                <Select value={ruleChannel} onValueChange={setRuleChannel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="VOICE">Voice</SelectItem>
                    <SelectItem value="PUSH">Push</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <Select value={ruleProvider} onValueChange={setRuleProvider}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TWILIO">Twilio</SelectItem>
                    <SelectItem value="VONAGE">Vonage</SelectItem>
                    <SelectItem value="MESSAGEBIRD">MessageBird</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button variant="outline" onClick={handleAddRoutingRule}>
              Add Rule
            </Button>
            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
              {routingRules.length === 0 ? (
                <div className="text-muted-foreground">No routing rules yet.</div>
              ) : (
                <div className="space-y-2">
                  {routingRules.map((rule: any, index: number) => (
                    <div
                      key={`${rule.name}-${index}`}
                      className={`flex items-center justify-between gap-2 rounded-md border border-transparent bg-background p-2 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform ${
                        dragRuleIndex === index
                          ? 'opacity-50 scale-[0.98]'
                          : dragOverIndex === index
                          ? 'border-primary/60 bg-primary/5'
                          : 'hover:shadow-sm'
                      }`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverIndex(index);
                      }}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={() => handleDrop(index)}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          className="mt-1 cursor-grab text-muted-foreground hover:text-foreground"
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragEnd={handleDragEnd}
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-muted-foreground">
                          {(rule.groups && rule.groups.length
                            ? rule.groups.map((group: any) =>
                                (group.conditions || [])
                                  .map((condition: any) => `${condition.field}:${condition.value}`)
                                  .join(` ${group.operator || 'AND'} `)
                              )
                            : (rule.conditions || []).map((condition: any) => `${condition.field}:${condition.value}`))
                            .join(` ${rule.operator || 'AND'} `)}{' '}
                          • {rule.channel} / {rule.provider}
                        </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleMoveRoutingRule(index, -1)}>
                          ↑
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleMoveRoutingRule(index, 1)}>
                          ↓
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRemoveRoutingRule(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Save Messaging Settings to persist routing rules.
            </div>
            <div className="rounded-lg border bg-muted/20 p-3 text-xs">
              <div className="text-sm font-medium text-muted-foreground">Chip Legend</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass('segment')}`}>
                  Segment
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass('tag')}`}>
                  Tag
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass('vip')}`}>
                  VIP
                </span>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${getChipClass('userType')}`}>
                  User Type
                </span>
                <span className="text-muted-foreground">
                  Colors are stable per value.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>
    </div>
  </TooltipProvider>
  );
}
