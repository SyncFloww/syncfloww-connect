import { useEffect, useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ExternalLink, CalendarClock, UserPlus, Send, Loader2, MessageCircle,
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Customer } from './CustomersTable';

interface ConversationMessage {
  id: string;
  author?: string | null;
  from?: 'customer' | 'agent' | string;
  text?: string | null;
  body?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
}

interface Props {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<Customer>) => Promise<void> | void;
  onScheduleFollowUp: (c: Customer) => void;
}

const fmtTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
};

const placeholder = (val: unknown, hint: string) => {
  if (val == null || val === '' || (Array.isArray(val) && val.length === 0)) {
    return <span className="text-xs italic text-muted-foreground">{hint}</span>;
  }
  return null;
};

export default function CustomerDrawer({
  customer, open, onOpenChange, onUpdate, onScheduleFollowUp,
}: Props) {
  const { toast } = useToast();
  const [thread, setThread] = useState<ConversationMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);

  const [agentDraft, setAgentDraft] = useState('');
  const [agentBusy, setAgentBusy] = useState(false);

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const MAX_MESSAGE_LENGTH = 1000;
  const trimmedLength = message.trim().length;
  const charCount = message.length;
  const overLimit = charCount > MAX_MESSAGE_LENGTH;
  const canSend = trimmedLength > 0 && !overLimit && !sending;

  useEffect(() => {
    if (!open || !customer) return;
    setAgentDraft(customer.assigned_agent || '');
    setMessage('');
    setThread([]);
    setThreadError(null);
    setThreadLoading(true);
    apiClient.get(`/api/customers/${customer.id}/conversation/`)
      .then(({ data }) => {
        const list: ConversationMessage[] = Array.isArray(data)
          ? data
          : data?.messages || data?.results || [];
        setThread(list);
      })
      .catch((err: any) => {
        setThreadError(err?.friendlyMessage || 'No conversation history yet.');
      })
      .finally(() => setThreadLoading(false));
  }, [open, customer]);

  if (!customer) return null;

  const saveAgent = async () => {
    if (agentDraft.trim() === (customer.assigned_agent || '')) return;
    setAgentBusy(true);
    await onUpdate(customer.id, { assigned_agent: agentDraft.trim() || null });
    setAgentBusy(false);
    toast({ title: 'Agent assigned', description: agentDraft.trim() || 'Cleared' });
  };

  const sendMessage = async () => {
    if (!canSend) return;
    setSending(true);
    setSendError(null);
    try {
      const { data } = await apiClient.post(`/api/customers/${customer.id}/messages/`, {
        text: message.trim(),
      });
      const newMsg: ConversationMessage = data?.id ? data : {
        id: `local-${Date.now()}`,
        from: 'agent',
        text: message.trim(),
        timestamp: new Date().toISOString(),
      };
      setThread((t) => [...t, newMsg]);
      setMessage('');
      toast({ title: 'Message sent' });
    } catch (err: any) {
      const friendly = err?.friendlyMessage
        || err?.response?.data?.detail
        || 'Could not send your message. Please try again.';
      setSendError(friendly);
      toast({
        title: 'Could not send',
        description: friendly,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-base font-semibold overflow-hidden shrink-0">
              {customer.avatar_url ? (
                <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                (customer.name || '?').slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate">{customer.name || 'Unnamed customer'}</SheetTitle>
              <SheetDescription className="truncate">
                {customer.handle || customer.source || 'No handle'}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-5">
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" onClick={() => onScheduleFollowUp(customer)}>
                <CalendarClock className="w-4 h-4 mr-1.5" /> Follow-up
              </Button>
              {customer.conversation_url ? (
                <Button size="sm" variant="outline" asChild>
                  <a href={customer.conversation_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1.5" /> Open thread
                  </a>
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled>
                  <ExternalLink className="w-4 h-4 mr-1.5" /> No thread
                </Button>
              )}
            </div>

            {/* Details */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</h3>
              <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Source</dt>
                <dd className="col-span-2">{customer.source || placeholder(null, 'Unknown source')}</dd>

                <dt className="text-muted-foreground">Intent</dt>
                <dd className="col-span-2">{customer.intent || placeholder(null, 'Not categorised')}</dd>

                <dt className="text-muted-foreground">Status</dt>
                <dd className="col-span-2">{customer.status || placeholder(null, 'No status set')}</dd>

                <dt className="text-muted-foreground">Value</dt>
                <dd className="col-span-2">
                  {customer.value != null
                    ? new Intl.NumberFormat(undefined, {
                        style: 'currency', currency: customer.currency || 'USD', maximumFractionDigits: 0,
                      }).format(customer.value)
                    : placeholder(null, 'No value recorded')}
                </dd>

                <dt className="text-muted-foreground">Last contact</dt>
                <dd className="col-span-2">
                  {customer.last_contact_at
                    ? fmtTime(customer.last_contact_at)
                    : placeholder(null, 'Never contacted')}
                </dd>

                <dt className="text-muted-foreground">Tags</dt>
                <dd className="col-span-2 flex flex-wrap gap-1">
                  {customer.tags && customer.tags.length > 0
                    ? customer.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)
                    : placeholder([], 'No tags')}
                </dd>

                <dt className="text-muted-foreground">Notes</dt>
                <dd className="col-span-2 whitespace-pre-wrap">
                  {customer.notes || placeholder(null, 'No notes yet')}
                </dd>
              </dl>
            </section>

            <Separator />

            {/* Assign agent */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <UserPlus className="w-3.5 h-3.5 inline mr-1" /> Assigned agent
              </h3>
              <div className="flex gap-2">
                <Input
                  value={agentDraft}
                  onChange={(e) => setAgentDraft(e.target.value)}
                  placeholder="Agent name or email"
                  className="h-9"
                />
                <Button
                  size="sm"
                  onClick={saveAgent}
                  disabled={agentBusy || agentDraft.trim() === (customer.assigned_agent || '')}
                >
                  {agentBusy && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                  Save
                </Button>
              </div>
            </section>

            <Separator />

            {/* Conversation history */}
            <section className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MessageCircle className="w-3.5 h-3.5 inline mr-1" /> Conversation
              </h3>
              {threadLoading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : threadError ? (
                <p className="text-xs italic text-muted-foreground py-3">{threadError}</p>
              ) : thread.length === 0 ? (
                <p className="text-xs italic text-muted-foreground py-3">
                  No messages exchanged yet.
                </p>
              ) : (
                <ul className="space-y-2 max-h-64 overflow-auto pr-1">
                  {thread.map((m) => {
                    const fromAgent = m.from === 'agent';
                    const text = m.text || m.body || '';
                    const ts = m.timestamp || m.created_at || '';
                    return (
                      <li
                        key={m.id}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm max-w-[85%]',
                          fromAgent
                            ? 'ml-auto bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="whitespace-pre-wrap">{text || <em className="opacity-60">empty</em>}</p>
                        <p className={cn(
                          'text-[10px] mt-1',
                          fromAgent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}>
                          {m.author || (fromAgent ? 'You' : customer.name)} · {fmtTime(ts)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </ScrollArea>

        {/* Send message footer */}
        <div className="border-t p-3 bg-background space-y-2">
          {sendError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-xs text-destructive"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p className="flex-1 leading-snug">{sendError}</p>
              <button
                type="button"
                onClick={() => setSendError(null)}
                className="opacity-70 hover:opacity-100"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <Textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (sendError) setSendError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${customer.name || 'customer'}…`}
              rows={2}
              aria-invalid={overLimit || !!sendError}
              aria-describedby="composer-help"
              className={cn(
                'min-h-[40px] max-h-32 resize-none text-sm py-2',
                (overLimit || sendError) && 'border-destructive focus-visible:ring-destructive'
              )}
            />
            <Button size="sm" onClick={sendMessage} disabled={!canSend} className="h-9">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div
            id="composer-help"
            className="flex items-center justify-between text-[10px] px-1"
          >
            <span className="text-muted-foreground">
              Enter to send · Shift+Enter for newline
            </span>
            <span
              className={cn(
                'tabular-nums',
                overLimit
                  ? 'text-destructive font-medium'
                  : charCount > MAX_MESSAGE_LENGTH * 0.9
                  ? 'text-destructive/70'
                  : 'text-muted-foreground'
              )}
              aria-live="polite"
            >
              {charCount}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
