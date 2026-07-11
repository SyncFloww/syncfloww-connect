import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  BarChart3,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Music2,
  Download,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import apiClient from '@/lib/apiClient';

interface BrandAnalyticsPanelProps {
  brandId: string;
}

interface MetricSummary {
  impressions: number;
  engagements: number;
  followers: number;
  reach: number;
  impressions_change?: number;
  engagements_change?: number;
  followers_change?: number;
  reach_change?: number;
}

interface TimePoint {
  date: string;
  impressions: number;
  engagements: number;
}

interface PlatformMetric {
  platform: string;
  impressions: number;
  engagements: number;
  followers?: number;
}

type RangeKey = '7d' | '30d' | '90d';

const RANGE_LABEL: Record<RangeKey, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
};

const PLATFORM_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  twitter: { label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  tiktok: { label: 'TikTok', icon: Music2, color: 'text-foreground' },
};
const PLATFORM_ORDER = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'];

const chartConfig = {
  impressions: { label: 'Impressions', color: 'hsl(var(--primary))' },
  engagements: { label: 'Engagements', color: 'hsl(var(--accent-foreground))' },
} satisfies ChartConfig;

const formatNumber = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

export default function BrandAnalyticsPanel({ brandId }: BrandAnalyticsPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<MetricSummary | null>(null);
  const [series, setSeries] = useState<TimePoint[]>([]);
  const [platforms, setPlatforms] = useState<PlatformMetric[]>([]);
  const [range, setRange] = useState<RangeKey>('30d');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiClient.get(
          `/api/social/brands/${brandId}/analytics/`,
          { params: { range } }
        );
        if (cancelled) return;
        setSummary(data?.summary ?? null);
        setSeries(Array.isArray(data?.series) ? data.series : []);
        setPlatforms(Array.isArray(data?.platforms) ? data.platforms : []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.friendlyMessage || 'Analytics unavailable for this brand yet.');
        setSummary({ impressions: 0, engagements: 0, followers: 0, reach: 0 });
        setSeries([]);
        setPlatforms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [brandId, range]);

  const platformRows = useMemo(() => {
    const byKey = new Map(platforms.map((p) => [p.platform?.toLowerCase(), p]));
    return PLATFORM_ORDER.map((key) => {
      const meta = PLATFORM_META[key];
      const data = byKey.get(key);
      return {
        key,
        label: meta.label,
        icon: meta.icon,
        color: meta.color,
        impressions: data?.impressions ?? 0,
        engagements: data?.engagements ?? 0,
        followers: data?.followers ?? 0,
        connected: !!data,
      };
    });
  }, [platforms]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48 rounded-md" />
          <Skeleton className="h-9 w-44 rounded-md" />
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const metrics = [
    { key: 'impressions', label: 'Impressions', icon: Eye, value: summary?.impressions ?? 0, change: summary?.impressions_change },
    { key: 'engagements', label: 'Engagements', icon: Heart, value: summary?.engagements ?? 0, change: summary?.engagements_change },
    { key: 'followers', label: 'Followers', icon: Users, value: summary?.followers ?? 0, change: summary?.followers_change },
    { key: 'reach', label: 'Reach', icon: Share2, value: summary?.reach ?? 0, change: summary?.reach_change },
  ];

  const exportCsv = () => {
    const esc = (v: unknown) => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines: string[] = [];
    lines.push(`Range,${RANGE_LABEL[range]}`);
    lines.push('');
    lines.push('Summary');
    lines.push('Metric,Value,Change %');
    lines.push(['Impressions', summary?.impressions ?? 0, summary?.impressions_change ?? ''].map(esc).join(','));
    lines.push(['Engagements', summary?.engagements ?? 0, summary?.engagements_change ?? ''].map(esc).join(','));
    lines.push(['Followers', summary?.followers ?? 0, summary?.followers_change ?? ''].map(esc).join(','));
    lines.push(['Reach', summary?.reach ?? 0, summary?.reach_change ?? ''].map(esc).join(','));
    lines.push('');
    lines.push('By platform');
    lines.push('Platform,Impressions,Engagements,Followers');
    platformRows.forEach((r) =>
      lines.push([r.label, r.impressions, r.engagements, r.followers].map(esc).join(','))
    );
    if (series.length > 0) {
      lines.push('');
      lines.push('Time series');
      lines.push('Date,Impressions,Engagements');
      series.forEach((p) => lines.push([p.date, p.impressions, p.engagements].map(esc).join(',')));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">{RANGE_LABEL[range]}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!summary}>
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as RangeKey)}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="7d" aria-label="Last 7 days">7d</ToggleGroupItem>
            <ToggleGroupItem value="30d" aria-label="Last 30 days">30d</ToggleGroupItem>
            <ToggleGroupItem value="90d" aria-label="Last 90 days">90d</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {error && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const positive = (m.change ?? 0) >= 0;
          const TrendIcon = positive ? TrendingUp : TrendingDown;
          return (
            <Card key={m.key}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  {m.change !== undefined && (
                    <span
                      className={`text-xs font-medium flex items-center gap-1 ${
                        positive ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      <TrendIcon className="w-3 h-3" />
                      {Math.abs(m.change).toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold">{formatNumber(m.value)}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Engagement over time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No engagement data yet</p>
              <p className="text-xs">Publish content to see insights here</p>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="impressionsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="engagementsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--accent-foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={formatNumber} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="hsl(var(--primary))"
                  fill="url(#impressionsFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="engagements"
                  stroke="hsl(var(--accent-foreground))"
                  fill="url(#engagementsFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            By platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {platformRows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.key}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Icon className={`w-4 h-4 ${row.color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{row.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.connected ? `${formatNumber(row.followers)} followers` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Impressions</p>
                      <p className="text-sm font-semibold">{formatNumber(row.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Engagements</p>
                      <p className="text-sm font-semibold">{formatNumber(row.engagements)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
