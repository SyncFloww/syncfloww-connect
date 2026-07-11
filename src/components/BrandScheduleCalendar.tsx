import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, CalendarDays, FileImage, FileVideo, FileText, Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Props { brandId: string }

interface ScheduledPost {
  id: string;
  title?: string;
  thumbnail_url?: string;
  file_url?: string;
  media_type?: string;
  scheduled_at: string;
  status?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const isImage = (p: ScheduledPost) =>
  (p.media_type || '').startsWith('image') || /\.(png|jpe?g|gif|webp|avif)$/i.test(p.file_url || '');
const isVideo = (p: ScheduledPost) =>
  (p.media_type || '').startsWith('video') || /\.(mp4|mov|webm|m4v)$/i.test(p.file_url || '');

export default function BrandScheduleCalendar({ brandId }: Props) {
  const { toast } = useToast();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = startOfMonth(cursor).toISOString();
      const to = addMonths(cursor, 1).toISOString();
      const { data } = await apiClient.get(`/api/social/brands/${brandId}/scheduled-posts/`, {
        params: { from, to },
      });
      const list: ScheduledPost[] = Array.isArray(data) ? data : data?.results ?? [];
      setPosts(list.filter((p) => p.scheduled_at));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [brandId, cursor]);

  useEffect(() => { load(); }, [load]);

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(first);
      d.setDate(d.getDate() - (startWeekday - i));
      cells.push({ date: d, inMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), i), inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last);
      d.setDate(d.getDate() + 1);
      cells.push({ date: d, inMonth: d.getMonth() === cursor.getMonth() });
      if (cells.length >= 42) break;
    }
    return cells;
  }, [cursor]);

  const postsByDay = useMemo(() => {
    const map = new Map<string, ScheduledPost[]>();
    for (const p of posts) {
      const d = new Date(p.scheduled_at);
      if (isNaN(d.getTime())) continue;
      const k = dayKey(d);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(p);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));
    }
    return map;
  }, [posts]);

  const reschedule = async (postId: string, target: Date) => {
    const original = posts.find((p) => p.id === postId);
    if (!original) return;
    const oldDate = new Date(original.scheduled_at);
    if (sameDay(oldDate, target)) return;
    const newDate = new Date(target);
    newDate.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0);
    const newIso = newDate.toISOString();

    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, scheduled_at: newIso } : p)));
    setSavingId(postId);
    try {
      await apiClient.patch(`/api/social/brands/${brandId}/scheduled-posts/${postId}/`, {
        scheduled_at: newIso,
      });
      toast({ title: 'Rescheduled', description: `Moved to ${newDate.toLocaleString()}` });
    } catch (err: any) {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, scheduled_at: original.scheduled_at } : p))
      );
      toast({
        title: 'Could not reschedule',
        description: err?.friendlyMessage || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const today = new Date();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold">{monthLabel}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, -1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCursor(addMonths(cursor, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Drag a post to a different day to reschedule. Time of day stays the same.
      </p>

      <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden border bg-border">
        {WEEKDAYS.map((d) => (
          <div key={d} className="bg-muted/50 px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {loading
          ? Array.from({ length: 42 }).map((_, i) => (
              <div key={i} className="bg-card min-h-[88px] p-1.5">
                <Skeleton className="h-4 w-6 mb-2" />
              </div>
            ))
          : grid.map(({ date, inMonth }) => {
              const k = dayKey(date);
              const dayPosts = postsByDay.get(k) || [];
              const isToday = sameDay(date, today);
              const isOver = dragOverKey === k;
              return (
                <div
                  key={k + (inMonth ? 'i' : 'o')}
                  data-testid={`calendar-day-${k}`}
                  onDragOver={(e) => {
                    if (draggingId) {
                      e.preventDefault();
                      setDragOverKey(k);
                    }
                  }}
                  onDragLeave={() => setDragOverKey((cur) => (cur === k ? null : cur))}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverKey(null);
                    if (draggingId) {
                      reschedule(draggingId, date);
                      setDraggingId(null);
                    }
                  }}
                  className={cn(
                    'bg-card min-h-[88px] p-1.5 flex flex-col gap-1 transition-colors',
                    !inMonth && 'bg-muted/30',
                    isOver && 'bg-primary/10 ring-1 ring-primary'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        !inMonth && 'text-muted-foreground/60',
                        isToday &&
                          'inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground'
                      )}
                    >
                      {date.getDate()}
                    </span>
                    {dayPosts.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">{dayPosts.length}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    {dayPosts.slice(0, 3).map((p) => {
                      const Icon = isImage(p) ? FileImage : isVideo(p) ? FileVideo : FileText;
                      const time = new Date(p.scheduled_at).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      });
                      const saving = savingId === p.id;
                      return (
                        <div
                          key={p.id}
                          draggable={!saving}
                          onDragStart={() => setDraggingId(p.id)}
                          onDragEnd={() => { setDraggingId(null); setDragOverKey(null); }}
                          className={cn(
                            'group flex items-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-1.5 py-1 text-[11px] cursor-grab active:cursor-grabbing transition-opacity',
                            draggingId === p.id && 'opacity-50',
                            saving && 'opacity-60 cursor-wait'
                          )}
                          title={`${p.title || 'Post'} · ${new Date(p.scheduled_at).toLocaleString()}`}
                        >
                          {saving ? (
                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                          ) : (
                            <Icon className="w-3 h-3 shrink-0" />
                          )}
                          <span className="truncate flex-1">{p.title || 'Untitled'}</span>
                          <span className="text-[10px] opacity-70 shrink-0">{time}</span>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1">
                        +{dayPosts.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
