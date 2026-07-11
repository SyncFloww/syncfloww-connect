import { useCallback, useEffect, useMemo, useRef, useState, KeyboardEvent } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Instagram, Facebook, Twitter, Youtube, Music2, Mail, Globe, MessageCircle,
  ExternalLink, Search, Download, MoreHorizontal, Users as UsersIcon,
  ChevronLeft, ChevronRight, Plus, X, CalendarClock, Loader2, Tag,
  Columns3, Keyboard, AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import CustomerDrawer from './CustomerDrawer';

export interface Customer {
  id: string;
  name: string;
  handle?: string | null;
  avatar_url?: string | null;
  source?: string | null;
  intent?: string | null;
  status?: string | null;
  value?: number | null;
  currency?: string | null;
  assigned_agent?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  last_contact_at?: string | null;
  conversation_url?: string | null;
  conversation_channel?: string | null;
  brand_id?: string | null;
}

interface Props {
  brandId?: string;
  className?: string;
}

const SOURCE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  instagram: { label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  facebook: { label: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  twitter: { label: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  youtube: { label: 'YouTube', icon: Youtube, color: 'text-red-500' },
  tiktok: { label: 'TikTok', icon: Music2, color: 'text-foreground' },
  email: { label: 'Email', icon: Mail, color: 'text-muted-foreground' },
  web: { label: 'Website', icon: Globe, color: 'text-muted-foreground' },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-green-500' },
};

const INTENTS = ['sale', 'enquiry', 'support', 'partnership', 'other'] as const;
const STATUSES = ['new', 'in_progress', 'won', 'lost'] as const;
const PAGE_SIZE = 25;

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  in_progress: 'secondary',
  won: 'default',
  lost: 'destructive',
};

const prettyStatus = (s?: string | null) =>
  !s ? '—' : s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatMoney = (v?: number | null, ccy?: string | null) => {
  if (v == null) return '—';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency', currency: ccy || 'USD', maximumFractionDigits: 0,
    }).format(v);
  } catch {
    return `$${v.toLocaleString()}`;
  }
};

const csvEscape = (val: unknown) => {
  const s = val == null ? '' : String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const customersToCsv = (
  rows: Customer[],
  appliedFilters?: Record<string, string | number | undefined>,
) => {
  const headers = [
    'Name', 'Handle', 'Source', 'Intent', 'Status', 'Value', 'Currency',
    'Assigned agent', 'Tags', 'Last contact (ISO)', 'Last contact (local)',
    'Conversation channel', 'Conversation link', 'Notes',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((c) => [
      c.name, c.handle, c.source, c.intent, c.status, c.value, c.currency,
      c.assigned_agent, (c.tags || []).join('|'),
      c.last_contact_at,
      c.last_contact_at ? new Date(c.last_contact_at).toLocaleString() : '',
      c.conversation_channel, c.conversation_url, c.notes,
    ].map(csvEscape).join(',')),
  ];
  if (appliedFilters) {
    const entries = Object.entries(appliedFilters).filter(([, v]) => v != null && v !== '' && v !== 'all');
    lines.push('');
    lines.push('# Applied filters');
    lines.push('Filter,Value');
    entries.forEach(([k, v]) => lines.push(`${csvEscape(k)},${csvEscape(v)}`));
    lines.push(`exported_at,${csvEscape(new Date().toISOString())}`);
    lines.push(`row_count,${csvEscape(rows.length)}`);
  }
  return lines.join('\n');
};

const downloadCsv = (csv: string, name: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

interface InlineTagsProps {
  value: string[];
  onChange: (next: string[]) => void | Promise<void>;
  compact?: boolean;
}
function InlineTags({ value, onChange, compact }: InlineTagsProps) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(false);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) { setDraft(''); return; }
    onChange([...value, t]);
    setDraft('');
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && value.length > 0) {
      remove(value[value.length - 1]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex flex-wrap gap-1 rounded-md px-1.5 py-1 hover:bg-muted/60 transition-colors text-left',
            compact ? 'max-w-[180px]' : 'min-w-[160px]'
          )}
        >
          {value.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Tag className="w-3 h-3" /> Add tags
            </span>
          ) : (
            <>
              {value.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
              ))}
              {value.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{value.length - 3}
                </span>
              )}
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2" align="start">
        <div className="flex flex-wrap gap-1">
          {value.length === 0 && (
            <span className="text-xs text-muted-foreground">No tags yet</span>
          )}
          {value.map((t) => (
            <Badge key={t} variant="secondary" className="text-xs gap-1">
              {t}
              <button
                type="button"
                onClick={() => remove(t)}
                className="hover:text-destructive"
                aria-label={`Remove ${t}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-1">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Add tag, press Enter"
            className="h-8 text-xs"
          />
          <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={add}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Comma or Enter to add · Backspace to remove last
        </p>
      </PopoverContent>
    </Popover>
  );
}

type ColumnKey =
  | 'customer' | 'source' | 'intent' | 'status' | 'value' | 'agent'
  | 'tags' | 'last_contact' | 'conversation';

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: 'customer', label: 'Customer' },
  { key: 'source', label: 'Source' },
  { key: 'intent', label: 'Intent' },
  { key: 'status', label: 'Status' },
  { key: 'value', label: 'Value' },
  { key: 'agent', label: 'Agent' },
  { key: 'tags', label: 'Tags' },
  { key: 'last_contact', label: 'Last contact' },
  { key: 'conversation', label: 'Conversation' },
];

interface SavedPrefs {
  search?: string;
  sourceFilter?: string;
  statusFilter?: string;
  page?: number;
  visibleColumns?: ColumnKey[];
  brandId?: string;
}

const PREFS_KEY = 'customers:prefs:v1';
const loadPrefs = (): SavedPrefs => {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') as SavedPrefs;
  } catch {
    return {};
  }
};
const savePrefs = (p: SavedPrefs) => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
};

export default function CustomersTable({ brandId, className }: Props) {
  const { toast } = useToast();
  const initialPrefs = useRef<SavedPrefs>(loadPrefs());

  const [loading, setLoading] = useState(true);
  const [exportingAll, setExportingAll] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(initialPrefs.current.search || '');
  const [searchInput, setSearchInput] = useState(initialPrefs.current.search || '');
  const [sourceFilter, setSourceFilter] = useState<string>(initialPrefs.current.sourceFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>(initialPrefs.current.statusFilter || 'all');
  const [page, setPage] = useState(initialPrefs.current.page || 1);
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(initialPrefs.current.visibleColumns || ALL_COLUMNS.map((c) => c.key))
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusedRow, setFocusedRow] = useState<number>(-1);
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Bulk dialogs
  const [bulkField, setBulkField] = useState<null | 'intent' | 'status' | 'assigned_agent' | 'tags'>(null);
  const [bulkValue, setBulkValue] = useState<string>('');
  const [bulkTags, setBulkTags] = useState<string[]>([]);
  const [bulkTagsMode, setBulkTagsMode] = useState<'add' | 'replace'>('add');
  const [bulkBusy, setBulkBusy] = useState(false);

  // Follow-up scheduling
  const [followUpFor, setFollowUpFor] = useState<Customer | null>(null);
  const [followUpAt, setFollowUpAt] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpBusy, setFollowUpBusy] = useState(false);

  const isColVisible = (k: ColumnKey) => visibleColumns.has(k);
  const toggleColumn = (k: ColumnKey) =>
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      // Always keep at least the customer column visible
      if (next.size === 0) next.add('customer');
      return next;
    });

  // Persist prefs whenever they change
  useEffect(() => {
    savePrefs({
      search, sourceFilter, statusFilter, page,
      visibleColumns: Array.from(visibleColumns),
    });
  }, [search, sourceFilter, statusFilter, page, visibleColumns]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [sourceFilter, statusFilter, brandId]);

  const filterParams = useMemo(() => {
    const params: Record<string, string | number> = {};
    if (brandId) params.brand_id = brandId;
    if (search.trim()) params.search = search.trim();
    if (sourceFilter !== 'all') params.source = sourceFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    return params;
  }, [brandId, search, sourceFilter, statusFilter]);

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/api/customers/', {
        params: { ...filterParams, page: pageNum, page_size: PAGE_SIZE },
      });
      const list: Customer[] = Array.isArray(data) ? data : data?.results || [];
      const count: number = Array.isArray(data)
        ? list.length
        : (data?.count ?? data?.total ?? list.length);
      setCustomers(list);
      setTotalCount(count);
    } catch (err: any) {
      setError(err?.friendlyMessage || 'No customers to show yet.');
      setCustomers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filterParams]);

  useEffect(() => { fetchPage(page); }, [fetchPage, page]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const showingFrom = customers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = (page - 1) * PAGE_SIZE + customers.length;

  const allOnPageSelected = customers.length > 0 && customers.every((c) => selected.has(c.id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) customers.forEach((c) => next.delete(c.id));
      else customers.forEach((c) => next.add(c.id));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const clearSelection = () => setSelected(new Set());

  const updateCustomer = async (id: string, patch: Partial<Customer>) => {
    const prev = customers;
    setCustomers((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    try {
      await apiClient.patch(`/api/customers/${id}/`, patch);
    } catch (err: any) {
      setCustomers(prev);
      toast({
        title: 'Could not save change',
        description: err?.friendlyMessage || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const fetchAllFiltered = async (): Promise<Customer[]> => {
    const all: Customer[] = [];
    let pageNum = 1;
    // Cap to avoid runaway loops
    for (let i = 0; i < 200; i++) {
      const { data } = await apiClient.get('/api/customers/', {
        params: { ...filterParams, page: pageNum, page_size: 100 },
      });
      const list: Customer[] = Array.isArray(data) ? data : data?.results || [];
      all.push(...list);
      const hasMore = Array.isArray(data) ? false : !!data?.next;
      if (!hasMore || list.length === 0) break;
      pageNum += 1;
    }
    return all;
  };

  const appliedFilters = useMemo(() => ({
    brand_id: brandId || 'all',
    search: search || '',
    source: sourceFilter,
    status: statusFilter,
  }), [brandId, search, sourceFilter, statusFilter]);

  const exportSelected = () => {
    const rows = customers.filter((c) => selected.has(c.id));
    if (rows.length === 0) return;
    downloadCsv(
      customersToCsv(rows, { ...appliedFilters, scope: 'selected' }),
      `customers-selected-${new Date().toISOString().slice(0, 10)}.csv`
    );
    toast({ title: 'Exported', description: `${rows.length} customer${rows.length === 1 ? '' : 's'} downloaded.` });
  };

  const exportAll = async () => {
    setExportingAll(true);
    try {
      const rows = await fetchAllFiltered();
      if (rows.length === 0) {
        toast({ title: 'Nothing to export', description: 'No customers match your filters.' });
        return;
      }
      downloadCsv(
        customersToCsv(rows, { ...appliedFilters, scope: 'all_filtered' }),
        `customers-all-${new Date().toISOString().slice(0, 10)}.csv`
      );
      toast({ title: 'Exported', description: `${rows.length} customer${rows.length === 1 ? '' : 's'} downloaded.` });
    } catch (err: any) {
      toast({
        title: 'Export failed',
        description: err?.friendlyMessage || 'Could not download all rows.',
        variant: 'destructive',
      });
    } finally {
      setExportingAll(false);
    }
  };

  const openBulk = (field: typeof bulkField) => {
    setBulkField(field);
    setBulkValue('');
    setBulkTags([]);
    setBulkTagsMode('add');
  };

  const applyBulk = async () => {
    if (!bulkField || selected.size === 0) return;
    const ids = Array.from(selected);
    setBulkBusy(true);

    let patch: Partial<Customer> = {};
    if (bulkField === 'tags') {
      // For replace mode, send the new array. For add, merge per-row below.
      if (bulkTagsMode === 'replace') patch = { tags: bulkTags };
    } else {
      if (!bulkValue.trim()) { setBulkBusy(false); return; }
      patch = { [bulkField]: bulkValue.trim() } as Partial<Customer>;
    }

    const results = await Promise.allSettled(
      ids.map((id) => {
        if (bulkField === 'tags' && bulkTagsMode === 'add') {
          const existing = customers.find((c) => c.id === id)?.tags || [];
          const merged = Array.from(new Set([...existing, ...bulkTags]));
          return apiClient.patch(`/api/customers/${id}/`, { tags: merged }).then(() => merged);
        }
        return apiClient.patch(`/api/customers/${id}/`, patch);
      })
    );
    const succeeded: string[] = [];
    results.forEach((r, i) => { if (r.status === 'fulfilled') succeeded.push(ids[i]); });

    setCustomers((prev) =>
      prev.map((c) => {
        if (!succeeded.includes(c.id)) return c;
        if (bulkField === 'tags') {
          if (bulkTagsMode === 'replace') return { ...c, tags: bulkTags };
          const merged = Array.from(new Set([...(c.tags || []), ...bulkTags]));
          return { ...c, tags: merged };
        }
        return { ...c, ...patch };
      })
    );

    const failed = ids.length - succeeded.length;
    setBulkBusy(false);
    setBulkField(null);
    toast({
      title: failed === 0 ? 'Updated' : 'Updated with errors',
      description: `${succeeded.length} of ${ids.length} customers changed.`,
      variant: failed === 0 ? undefined : 'destructive',
    });
  };

  const openFollowUp = (c: Customer) => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    setFollowUpFor(c);
    setFollowUpAt(d.toISOString().slice(0, 16));
    setFollowUpNote('');
  };

  const submitFollowUp = async () => {
    if (!followUpFor || !followUpAt) return;
    setFollowUpBusy(true);
    const iso = new Date(followUpAt).toISOString();
    try {
      await apiClient.post('/api/calendar/events/', {
        type: 'follow_up',
        title: `Follow up with ${followUpFor.name}`,
        scheduled_at: iso,
        customer_id: followUpFor.id,
        brand_id: followUpFor.brand_id || brandId || null,
        notes: followUpNote || null,
      });
      toast({
        title: 'Follow-up scheduled',
        description: `${followUpFor.name} · ${new Date(iso).toLocaleString()}`,
      });
      setFollowUpFor(null);
    } catch (err: any) {
      toast({
        title: 'Could not schedule',
        description: err?.friendlyMessage || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setFollowUpBusy(false);
    }
  };

  const selectedCount = selected.size;
  const totalPagesForKb = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Global keyboard shortcuts
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
    };
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === '?' && !isTypingTarget(e.target)) {
        e.preventDefault();
        setShowShortcuts((v) => !v);
        return;
      }
      if (e.key === '/' && !isTypingTarget(e.target)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key === 'Escape') {
        if (drawerCustomer) { setDrawerCustomer(null); return; }
        if (focusedRow >= 0) { setFocusedRow(-1); return; }
      }
      if (isTypingTarget(e.target)) return;

      if (e.key === 'PageDown' || (e.shiftKey && e.key === 'ArrowRight')) {
        e.preventDefault();
        setPage((p) => Math.min(totalPagesForKb, p + 1));
        return;
      }
      if (e.key === 'PageUp' || (e.shiftKey && e.key === 'ArrowLeft')) {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
        return;
      }
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const keys = ['all', ...Object.keys(SOURCE_META)];
        const idx = keys.indexOf(sourceFilter);
        setSourceFilter(keys[(idx + 1) % keys.length]);
        return;
      }
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        const keys = ['all', ...STATUSES] as string[];
        const idx = keys.indexOf(statusFilter);
        setStatusFilter(keys[(idx + 1) % keys.length]);
        return;
      }
      if (customers.length === 0) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        setFocusedRow((r) => Math.min(customers.length - 1, r < 0 ? 0 : r + 1));
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        setFocusedRow((r) => Math.max(0, r < 0 ? 0 : r - 1));
        return;
      }
      if (e.key === 'Home') { e.preventDefault(); setFocusedRow(0); return; }
      if (e.key === 'End') { e.preventDefault(); setFocusedRow(customers.length - 1); return; }
      if (e.key === ' ' && focusedRow >= 0) {
        e.preventDefault();
        toggleOne(customers[focusedRow].id);
        return;
      }
      if (e.key === 'Enter' && focusedRow >= 0) {
        e.preventDefault();
        const c = customers[focusedRow];
        if (e.shiftKey) setDrawerCustomer(c);
        else if (c.conversation_url) window.open(c.conversation_url, '_blank', 'noopener,noreferrer');
        else setDrawerCustomer(c);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers, focusedRow, drawerCustomer, sourceFilter, statusFilter, totalPagesForKb]);

  useEffect(() => { setFocusedRow(-1); }, [page, search, sourceFilter, statusFilter, brandId]);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search customers, tags, notes…  (press / to focus)"
            className="pl-8"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {Object.entries(SOURCE_META).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Columns3 className="w-4 h-4 mr-1.5" /> Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_COLUMNS.map((col) => (
              <DropdownMenuCheckboxItem
                key={col.key}
                checked={isColVisible(col.key)}
                onCheckedChange={() => toggleColumn(col.key)}
                onSelect={(e) => e.preventDefault()}
                disabled={col.key === 'customer'}
              >
                {col.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exportingAll}>
              {exportingAll ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportSelected} disabled={selectedCount === 0}>
              Selected ({selectedCount})
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => downloadCsv(
                customersToCsv(customers, { ...appliedFilters, scope: 'page', page }),
                `customers-page-${page}.csv`
              )}
            >
              Current page ({customers.length})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportAll}>
              All filtered ({totalCount})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShowShortcuts(true)}
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {error && (
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              {isColVisible('customer') && <TableHead>Customer</TableHead>}
              {isColVisible('source') && <TableHead>Source</TableHead>}
              {isColVisible('intent') && <TableHead>Intent</TableHead>}
              {isColVisible('status') && <TableHead>Status</TableHead>}
              {isColVisible('value') && <TableHead className="text-right">Value</TableHead>}
              {isColVisible('agent') && <TableHead>Agent</TableHead>}
              {isColVisible('tags') && <TableHead>Tags</TableHead>}
              {isColVisible('last_contact') && <TableHead>Last contact</TableHead>}
              {isColVisible('conversation') && <TableHead className="w-32">Conversation</TableHead>}
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: visibleColumns.size + 2 }).map((__, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.size + 2}>
                  <div className="py-12 flex flex-col items-center text-muted-foreground">
                    <UsersIcon className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm">No customers match your filters yet.</p>
                    <p className="text-xs">They’ll appear here as conversations come in.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((c, idx) => {
                const SrcIcon = SOURCE_META[(c.source || '').toLowerCase()]?.icon || Globe;
                const srcMeta = SOURCE_META[(c.source || '').toLowerCase()];
                const isFocused = focusedRow === idx;
                return (
                  <TableRow
                    key={c.id}
                    data-state={selected.has(c.id) ? 'selected' : undefined}
                    className={cn(
                      'cursor-pointer',
                      isFocused && 'bg-accent/50 outline outline-2 outline-primary/40 outline-offset-[-2px]'
                    )}
                    onClick={(e) => {
                      // Avoid hijacking clicks on interactive elements
                      const tgt = e.target as HTMLElement;
                      if (tgt.closest('button, a, input, [role="combobox"], [role="menuitem"], [role="checkbox"]')) return;
                      setFocusedRow(idx);
                      setDrawerCustomer(c);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected.has(c.id)}
                        onCheckedChange={() => toggleOne(c.id)}
                        aria-label={`Select ${c.name}`}
                      />
                    </TableCell>
                    {isColVisible('customer') && (
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
                            {c.avatar_url ? (
                              <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              (c.name || '?').slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {c.name || <span className="italic text-muted-foreground">Unnamed customer</span>}
                            </p>
                            {c.handle
                              ? <p className="text-xs text-muted-foreground truncate">{c.handle}</p>
                              : <p className="text-[10px] italic text-muted-foreground/70">No handle</p>}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    {isColVisible('source') && (
                      <TableCell>
                        {c.source ? (
                          <div className="flex items-center gap-1.5">
                            <SrcIcon className={cn('w-4 h-4', srcMeta?.color || 'text-muted-foreground')} />
                            <span className="text-sm">{srcMeta?.label || c.source}</span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">Unknown source</span>
                        )}
                      </TableCell>
                    )}
                    {isColVisible('intent') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={c.intent || ''}
                          onValueChange={(v) => updateCustomer(c.id, { intent: v })}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 w-[120px] text-xs',
                              !c.intent && 'border-dashed text-muted-foreground'
                            )}
                          >
                            <SelectValue placeholder="Set intent" />
                          </SelectTrigger>
                          <SelectContent>
                            {INTENTS.map((i) => (
                              <SelectItem key={i} value={i}>{prettyStatus(i)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                    {isColVisible('status') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={c.status || ''}
                          onValueChange={(v) => updateCustomer(c.id, { status: v })}
                        >
                          <SelectTrigger
                            className={cn(
                              'h-8 w-[130px] text-xs',
                              !c.status && 'border-dashed text-muted-foreground'
                            )}
                          >
                            <SelectValue placeholder="Set status">
                              {c.status && (
                                <Badge variant={STATUS_VARIANT[c.status] || 'outline'} className="text-[10px]">
                                  {prettyStatus(c.status)}
                                </Badge>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    )}
                    {isColVisible('value') && (
                      <TableCell className="text-right text-sm font-medium">
                        {c.value != null ? (
                          formatMoney(c.value, c.currency)
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center gap-1 text-xs italic text-muted-foreground cursor-help">
                                  <AlertCircle className="w-3 h-3" /> Not set
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>No deal value recorded yet</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    )}
                    {isColVisible('agent') && (
                      <TableCell className="text-sm">
                        {c.assigned_agent || (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setDrawerCustomer(c); }}
                            className="text-xs italic text-muted-foreground hover:text-primary hover:underline"
                          >
                            Unassigned · assign
                          </button>
                        )}
                      </TableCell>
                    )}
                    {isColVisible('tags') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <InlineTags
                          compact
                          value={c.tags || []}
                          onChange={(next) => updateCustomer(c.id, { tags: next })}
                        />
                      </TableCell>
                    )}
                    {isColVisible('last_contact') && (
                      <TableCell className="text-sm whitespace-nowrap">
                        {c.last_contact_at ? (
                          <span className="text-muted-foreground">{formatDate(c.last_contact_at)}</span>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">Never contacted</span>
                        )}
                      </TableCell>
                    )}
                    {isColVisible('conversation') && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {c.conversation_url ? (
                          <a
                            href={c.conversation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            {c.conversation_channel || 'Open'}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDrawerCustomer(c)}
                            className="text-xs italic text-muted-foreground hover:text-primary hover:underline"
                          >
                            No thread · view
                          </button>
                        )}
                      </TableCell>
                    )}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDrawerCustomer(c)}>
                            <UsersIcon className="w-4 h-4 mr-2" /> View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openFollowUp(c)}>
                            <CalendarClock className="w-4 h-4 mr-2" />
                            Schedule follow-up
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Quick status</DropdownMenuLabel>
                          {STATUSES.map((s) => (
                            <DropdownMenuItem key={s} onClick={() => updateCustomer(c.id, { status: s })}>
                              {prettyStatus(s)}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => downloadCsv(
                              customersToCsv([c], { ...appliedFilters, scope: 'single_row' }),
                              `customer-${c.id}.csv`
                            )}
                          >
                            <Download className="w-4 h-4 mr-2" /> Export row
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 text-sm text-muted-foreground">
        <span>
          {totalCount > 0
            ? `Showing ${showingFrom}–${showingTo} of ${totalCount}`
            : 'No results'}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          <span className="px-2 text-xs">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="sticky bottom-2 z-10 flex items-center justify-between flex-wrap gap-2 rounded-md border bg-background/95 backdrop-blur shadow-md px-3 py-2 text-sm">
          <span className="font-medium">{selectedCount} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => openBulk('intent')}>Set intent</Button>
            <Button size="sm" variant="outline" onClick={() => openBulk('status')}>Set status</Button>
            <Button size="sm" variant="outline" onClick={() => openBulk('assigned_agent')}>Assign agent</Button>
            <Button size="sm" variant="outline" onClick={() => openBulk('tags')}>Edit tags</Button>
            <Button size="sm" variant="outline" onClick={exportSelected}>
              <Download className="w-4 h-4 mr-1.5" /> Export
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
          </div>
        </div>
      )}

      {/* Bulk edit dialog */}
      <Dialog open={!!bulkField} onOpenChange={(o) => !o && setBulkField(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkField === 'intent' && 'Set intent'}
              {bulkField === 'status' && 'Set status'}
              {bulkField === 'assigned_agent' && 'Assign agent'}
              {bulkField === 'tags' && 'Edit tags'}
            </DialogTitle>
            <DialogDescription>
              Applies to {selectedCount} selected customer{selectedCount === 1 ? '' : 's'}.
            </DialogDescription>
          </DialogHeader>

          {bulkField === 'intent' && (
            <Select value={bulkValue} onValueChange={setBulkValue}>
              <SelectTrigger><SelectValue placeholder="Choose intent" /></SelectTrigger>
              <SelectContent>
                {INTENTS.map((i) => (
                  <SelectItem key={i} value={i}>{prettyStatus(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {bulkField === 'status' && (
            <Select value={bulkValue} onValueChange={setBulkValue}>
              <SelectTrigger><SelectValue placeholder="Choose status" /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{prettyStatus(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {bulkField === 'assigned_agent' && (
            <div className="space-y-2">
              <Label htmlFor="bulk-agent">Agent name or email</Label>
              <Input
                id="bulk-agent"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder="e.g. Maya"
              />
            </div>
          )}
          {bulkField === 'tags' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={bulkTagsMode === 'add' ? 'default' : 'outline'}
                  onClick={() => setBulkTagsMode('add')}
                >
                  Add to existing
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={bulkTagsMode === 'replace' ? 'default' : 'outline'}
                  onClick={() => setBulkTagsMode('replace')}
                >
                  Replace all
                </Button>
              </div>
              <div className="rounded-md border p-2">
                <InlineTags value={bulkTags} onChange={(next) => setBulkTags(next)} />
              </div>
              <p className="text-xs text-muted-foreground">
                {bulkTagsMode === 'add'
                  ? 'These tags are merged with each customer’s existing tags.'
                  : 'Each selected customer’s tags are replaced with this list.'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkField(null)} disabled={bulkBusy}>
              Cancel
            </Button>
            <Button
              onClick={applyBulk}
              disabled={
                bulkBusy ||
                (bulkField !== 'tags' && !bulkValue.trim()) ||
                (bulkField === 'tags' && bulkTagsMode === 'add' && bulkTags.length === 0)
              }
            >
              {bulkBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply to {selectedCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up dialog */}
      <Dialog open={!!followUpFor} onOpenChange={(o) => !o && setFollowUpFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule follow-up</DialogTitle>
            <DialogDescription>
              {followUpFor?.name ? `With ${followUpFor.name}.` : ''} Adds an entry to the calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="followup-at">When</Label>
              <Input
                id="followup-at"
                type="datetime-local"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="followup-note">Note (optional)</Label>
              <Input
                id="followup-note"
                value={followUpNote}
                onChange={(e) => setFollowUpNote(e.target.value)}
                placeholder="What’s this follow-up about?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpFor(null)} disabled={followUpBusy}>
              Cancel
            </Button>
            <Button onClick={submitFollowUp} disabled={followUpBusy || !followUpAt}>
              {followUpBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer details drawer */}
      <CustomerDrawer
        customer={drawerCustomer}
        open={!!drawerCustomer}
        onOpenChange={(o) => !o && setDrawerCustomer(null)}
        onUpdate={updateCustomer}
        onScheduleFollowUp={(c) => { setDrawerCustomer(null); openFollowUp(c); }}
      />

      {/* Keyboard shortcuts cheat-sheet */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Speed through your customer queue without touching the mouse.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {[
              { keys: ['↑', '↓', 'or', 'j', 'k'], label: 'Move between rows' },
              { keys: ['Home', 'End'], label: 'Jump to first / last row' },
              { keys: ['Space'], label: 'Toggle row selection' },
              { keys: ['Enter'], label: 'Open conversation thread' },
              { keys: ['Shift', '+', 'Enter'], label: 'Open details drawer' },
              { keys: ['/'], label: 'Focus search' },
              { keys: ['F'], label: 'Cycle source filter' },
              { keys: ['S'], label: 'Cycle status filter' },
              { keys: ['PgUp', 'PgDn'], label: 'Previous / next page' },
              { keys: ['Esc'], label: 'Close drawer or clear focus' },
              { keys: ['?'], label: 'Show / hide this help' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{row.label}</span>
                <div className="flex items-center gap-1">
                  {row.keys.map((k, i) => (
                    k === '+' || k === 'or'
                      ? <span key={i} className="text-xs text-muted-foreground">{k}</span>
                      : <kbd key={i} className="px-1.5 py-0.5 rounded border bg-muted text-xs font-mono">{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
