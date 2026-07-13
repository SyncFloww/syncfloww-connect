import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  CheckCircle2,
  Users,
  Gift,
  Share2,
  ExternalLink,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferralEntry {
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  referrals: ReferralEntry[];
  referred_by_email: string | null;
}

export default function Referral() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    apiClient
      .get('/api/auth/referral/stats/')
      .then((r) => setStats(r.data.data))
      .catch(() =>
        toast({ title: 'Could not load referral data', variant: 'destructive' })
      )
      .finally(() => setLoading(false));
  }, []);

  const copy = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      } else {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
      toast({ title: 'Copied to clipboard!' });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive' });
    }
  };

  const shareLink = async () => {
    if (!stats?.referral_link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on SyncFloww',
          text: 'I use SyncFloww to supercharge my social media marketing with AI. Join me!',
          url: stats.referral_link,
        });
      } catch {
        // user cancelled
      }
    } else {
      copy(stats.referral_link, 'link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Unable to load referral data. Please try again.
      </div>
    );
  }

  const metricCards = [
    {
      icon: Users,
      label: 'Total Referrals',
      value: stats.total_referrals,
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: Gift,
      label: 'Your Code',
      value: stats.referral_code || '—',
      color: 'from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-500',
    },
    {
      icon: UserCheck,
      label: 'Referred By',
      value: stats.referred_by_email
        ? stats.referred_by_email.split('@')[0]
        : 'Direct sign-up',
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-500',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-foreground">Referral Programme</h1>
        <p className="text-muted-foreground mt-1">
          Share your code and grow the SyncFloww community together.
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl bg-gradient-to-br ${card.color} border border-border/50 p-5 flex items-center gap-4`}
          >
            <div className={`p-3 rounded-xl bg-background/60 ${card.iconColor}`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
              <p className="text-xl font-bold text-foreground truncate max-w-[140px]">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Share Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" /> Share Your Referral
        </h2>

        {/* Code row */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Your Referral Code</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-widest text-foreground select-all">
              {stats.referral_code || '—'}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => stats.referral_code && copy(stats.referral_code, 'code')}
              disabled={!stats.referral_code}
            >
              <AnimatePresence mode="wait">
                {codeCopied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Link row */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Referral Link</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground truncate">
              {stats.referral_link || '—'}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => stats.referral_link && copy(stats.referral_link, 'link')}
              disabled={!stats.referral_link}
            >
              <AnimatePresence mode="wait">
                {linkCopied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={shareLink}
              disabled={!stats.referral_link}
              title="Share link"
            >
              <ExternalLink className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            className="rounded-xl"
            onClick={shareLink}
            disabled={!stats.referral_link}
          >
            <Share2 className="w-4 h-4 mr-2" /> Share Invite Link
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              stats.referral_link &&
              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  `Join me on SyncFloww — AI-powered social media marketing! Sign up with my link: ${stats.referral_link}`
                )}`,
                '_blank'
              )
            }
            disabled={!stats.referral_link}
          >
            WhatsApp
          </Button>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              stats.referral_link &&
              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `I use @SyncFloww for AI-powered social media marketing. Join me! ${stats.referral_link}`
                )}`,
                '_blank'
              )
            }
            disabled={!stats.referral_link}
          >
            Twitter / X
          </Button>
        </div>
      </motion.div>

      {/* Referrals Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> People You've Referred
          </h2>
          <span className="text-sm text-muted-foreground">
            {stats.total_referrals} {stats.total_referrals === 1 ? 'person' : 'people'}
          </span>
        </div>

        {stats.referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Gift className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share your code or link above to start referring people.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.referrals.map((r, i) => (
              <motion.div
                key={r.email}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                  {(r.first_name?.[0] || r.email[0]).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {r.first_name || r.last_name
                      ? `${r.first_name} ${r.last_name}`.trim()
                      : r.email}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{r.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.date_joined).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-medium mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Joined
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
