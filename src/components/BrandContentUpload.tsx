import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  FileText,
  CheckCircle2,
  AlertCircle,
  Trash2,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface BrandContentUploadProps {
  brandId: string;
  onUploaded?: () => void;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'done' | 'error';
  error?: string;
}

interface ContentItem {
  id: string;
  title?: string;
  file_url?: string;
  thumbnail_url?: string;
  media_type?: string;
  status?: string;
  created_at?: string;
}

const ACCEPTED = 'image/*,video/*,application/pdf';
const MAX_SIZE_MB = 50;

const fileIcon = (file: File) => {
  if (file.type.startsWith('image/')) return FileImage;
  if (file.type.startsWith('video/')) return FileVideo;
  return FileText;
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (item: ContentItem) =>
  (item.media_type || '').startsWith('image') ||
  /\.(png|jpe?g|gif|webp|avif)$/i.test(item.file_url || '');

const isVideo = (item: ContentItem) =>
  (item.media_type || '').startsWith('video') ||
  /\.(mp4|mov|webm|m4v)$/i.test(item.file_url || '');

export default function BrandContentUpload({ brandId, onUploaded }: BrandContentUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ContentItem | null>(null);
  const [scheduleTarget, setScheduleTarget] = useState<ContentItem | null>(null);
  const [scheduleAt, setScheduleAt] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkScheduleOpen, setBulkScheduleOpen] = useState(false);
  const [bulkScheduleAt, setBulkScheduleAt] = useState('');

  const loadContent = useCallback(async () => {
    setContentLoading(true);
    try {
      const { data } = await apiClient.get(`/api/social/brands/${brandId}/content/`);
      setContent(Array.isArray(data) ? data : data?.results ?? []);
    } catch {
      setContent([]);
    } finally {
      setContentLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const uploadFile = useCallback(
    async (item: UploadItem) => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: 'uploading' } : i)));
      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('brand', brandId);

      try {
        await apiClient.post(`/api/social/brands/${brandId}/content/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const total = e.total || item.file.size;
            const progress = Math.round((e.loaded * 100) / total);
            setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress } : i)));
          },
        });
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'done', progress: 100 } : i))
        );
        onUploaded?.();
        loadContent();
      } catch (err: any) {
        const msg = err?.friendlyMessage || err?.response?.data?.detail || 'Upload failed';
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: msg } : i))
        );
        toast({ title: 'Upload failed', description: msg, variant: 'destructive' });
      }
    },
    [brandId, onUploaded, toast, loadContent]
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const valid: UploadItem[] = [];
      for (const file of files) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: `${file.name} exceeds ${MAX_SIZE_MB}MB`,
            variant: 'destructive',
          });
          continue;
        }
        valid.push({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          progress: 0,
          status: 'queued',
        });
      }
      if (valid.length === 0) return;
      setItems((prev) => [...valid, ...prev]);
    },
    [toast]
  );

  useEffect(() => {
    const queued = items.filter((i) => i.status === 'queued');
    queued.forEach((i) => uploadFile(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clearCompleted = () =>
    setItems((prev) => prev.filter((i) => i.status !== 'done' && i.status !== 'error'));

  const hasCompleted = items.some((i) => i.status === 'done' || i.status === 'error');

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionBusy(true);
    try {
      await apiClient.delete(`/api/social/brands/${brandId}/content/${deleteTarget.id}/`);
      setContent((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({ title: 'Content deleted' });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err?.friendlyMessage || 'Could not delete this content',
        variant: 'destructive',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const confirmSchedule = async () => {
    if (!scheduleTarget || !scheduleAt) return;
    setActionBusy(true);
    try {
      await apiClient.post(
        `/api/social/brands/${brandId}/content/${scheduleTarget.id}/schedule/`,
        { scheduled_at: new Date(scheduleAt).toISOString() }
      );
      toast({ title: 'Post scheduled', description: `For ${new Date(scheduleAt).toLocaleString()}` });
      setScheduleTarget(null);
      setScheduleAt('');
      loadContent();
    } catch (err: any) {
      toast({
        title: 'Schedule failed',
        description: err?.friendlyMessage || 'Could not schedule this post',
        variant: 'destructive',
      });
    } finally {
      setActionBusy(false);
    }
  };

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allSelected = content.length > 0 && content.every((c) => selectedIds.has(c.id));
  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(content.map((c) => c.id)));

  const clearSelection = () => setSelectedIds(new Set());

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setActionBusy(true);
    const results = await Promise.allSettled(
      ids.map((id) => apiClient.delete(`/api/social/brands/${brandId}/content/${id}/`))
    );
    const succeeded = results
      .map((r, i) => (r.status === 'fulfilled' ? ids[i] : null))
      .filter(Boolean) as string[];
    const failed = ids.length - succeeded.length;
    setContent((prev) => prev.filter((c) => !succeeded.includes(c.id)));
    clearSelection();
    setBulkDeleteOpen(false);
    setActionBusy(false);
    toast({
      title: failed === 0 ? 'Content deleted' : 'Deleted with errors',
      description: `${succeeded.length} removed${failed ? `, ${failed} failed` : ''}.`,
      variant: failed === 0 ? undefined : 'destructive',
    });
  };

  const confirmBulkSchedule = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0 || !bulkScheduleAt) return;
    setActionBusy(true);
    const iso = new Date(bulkScheduleAt).toISOString();
    const results = await Promise.allSettled(
      ids.map((id) =>
        apiClient.post(`/api/social/brands/${brandId}/content/${id}/schedule/`, {
          scheduled_at: iso,
        })
      )
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = ids.length - succeeded;
    clearSelection();
    setBulkScheduleOpen(false);
    setBulkScheduleAt('');
    setActionBusy(false);
    loadContent();
    toast({
      title: failed === 0 ? 'Posts scheduled' : 'Scheduled with errors',
      description: `${succeeded} of ${ids.length} for ${new Date(iso).toLocaleString()}.`,
      variant: failed === 0 ? undefined : 'destructive',
    });
  };

  return (
    <div className="space-y-5">
      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-dashed border-2 transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="font-medium mb-1">Drag & drop content here</p>
          <p className="text-sm text-muted-foreground mb-4">
            Images, videos, or PDFs up to {MAX_SIZE_MB}MB
          </p>
          <label>
            <input type="file" multiple accept={ACCEPTED} className="hidden" onChange={onSelect} />
            <Button type="button" variant="outline" asChild>
              <span>Choose files</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Uploads ({items.length})</p>
            {hasCompleted && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear completed
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => {
              const Icon = fileIcon(item.file);
              return (
                <Card key={item.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatBytes(item.file.size)}
                        </span>
                      </div>
                      {item.status === 'uploading' && (
                        <Progress value={item.progress} className="h-1 mt-1.5" />
                      )}
                      {item.status === 'error' && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {item.error}
                        </p>
                      )}
                      {item.status === 'done' && (
                        <p className="text-xs text-success mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Uploaded
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {content.length > 0 && (
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Select all"
              />
            )}
            <p className="text-sm font-medium">
              Library {content.length > 0 && `(${content.length})`}
              {selectedIds.size > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  · {selectedIds.size} selected
                </span>
              )}
            </p>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const d = new Date();
                  d.setHours(d.getHours() + 1, 0, 0, 0);
                  setBulkScheduleAt(d.toISOString().slice(0, 16));
                  setBulkScheduleOpen(true);
                }}
              >
                <CalendarClock className="w-4 h-4 mr-1.5" />
                Schedule
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {contentLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : content.length === 0 ? (
          <div className="rounded-md border border-dashed py-10 text-center text-muted-foreground">
            <FileImage className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {content.map((item) => {
              const thumb = item.thumbnail_url || (isImage(item) ? item.file_url : undefined);
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'group relative aspect-square rounded-md overflow-hidden border bg-muted transition-shadow',
                    isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                  )}
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.title || 'Content'}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo(item) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileVideo className="w-8 h-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  <div
                    className={cn(
                      'absolute top-1.5 right-1.5 z-10 rounded-md bg-background/90 backdrop-blur p-1 shadow-sm transition-opacity',
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(item.id)}
                      aria-label="Select item"
                    />
                  </div>

                  {item.status && (
                    <span className="absolute top-1.5 left-1.5 text-[10px] uppercase tracking-wide bg-background/80 backdrop-blur px-1.5 py-0.5 rounded">
                      {item.status}
                    </span>
                  )}

                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => {
                        setScheduleTarget(item);
                        const d = new Date();
                        d.setHours(d.getHours() + 1, 0, 0, 0);
                        setScheduleAt(d.toISOString().slice(0, 16));
                      }}
                      title="Schedule post"
                    >
                      <CalendarClock className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the file from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={actionBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!scheduleTarget} onOpenChange={(o) => !o && setScheduleTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule post</DialogTitle>
            <DialogDescription>
              Pick when this content should be published.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="schedule-at">Date & time</Label>
            <Input
              id="schedule-at"
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleTarget(null)} disabled={actionBusy}>
              Cancel
            </Button>
            <Button onClick={confirmSchedule} disabled={actionBusy || !scheduleAt}>
              {actionBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} item{selectedIds.size === 1 ? '' : 's'}?</AlertDialogTitle>
            <AlertDialogDescription>
              These files will be permanently removed from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmBulkDelete(); }}
              disabled={actionBusy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkScheduleOpen} onOpenChange={setBulkScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule {selectedIds.size} post{selectedIds.size === 1 ? '' : 's'}</DialogTitle>
            <DialogDescription>
              All selected items will be scheduled for the same time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-schedule-at">Date & time</Label>
            <Input
              id="bulk-schedule-at"
              type="datetime-local"
              value={bulkScheduleAt}
              onChange={(e) => setBulkScheduleAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkScheduleOpen(false)} disabled={actionBusy}>
              Cancel
            </Button>
            <Button onClick={confirmBulkSchedule} disabled={actionBusy || !bulkScheduleAt}>
              {actionBusy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
