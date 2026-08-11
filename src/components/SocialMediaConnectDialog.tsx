import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Globe, Calendar, Send, Link as LinkIcon, Check, Phone, Mail } from 'lucide-react';
import apiClient from '@/lib/apiClient';

export interface SocialPlatform {
  id: string;
  name: string;
  category: 'social' | 'messaging' | 'google' | 'other';
  placeholder: string;
  icon: React.ReactNode;
  color: string;
}

export const PLATFORMS: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook Page',
    category: 'social',
    placeholder: 'Page name or handle e.g. @syncfloww',
    icon: (
      <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: '#1877F2',
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    category: 'social',
    placeholder: 'Username e.g. @syncfloww.official',
    icon: (
      <svg className="w-6 h-6" fill="#E4405F" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    color: '#E4405F',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'messaging',
    placeholder: 'Phone number e.g. +1234567890',
    icon: <Phone className="w-6 h-6 text-emerald-500" />,
    color: '#25D366',
  },
  {
    id: 'youtube',
    name: 'YouTube Channel',
    category: 'google',
    placeholder: 'Channel handle or name e.g. @SyncFloww',
    icon: (
      <svg className="w-6 h-6" fill="#FF0000" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: '#FF0000',
  },
  {
    id: 'gmail',
    name: 'Gmail / Google Workspace',
    category: 'google',
    placeholder: 'Email address e.g. brand@gmail.com',
    icon: <Mail className="w-6 h-6 text-red-500" />,
    color: '#EA4335',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Page',
    category: 'social',
    placeholder: 'Company page or handle e.g. syncfloww',
    icon: (
      <svg className="w-6 h-6" fill="#0A66C2" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: '#0A66C2',
  },
  {
    id: 'x-twitter',
    name: 'X (formerly Twitter)',
    category: 'social',
    placeholder: 'Handle e.g. @syncfloww',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: '#000000',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    placeholder: 'Handle e.g. @syncfloww',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
    color: '#000000',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'google',
    placeholder: 'Email or Shared folder link',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.21 3.31l3.57 2.77c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.83 10.83 0 0012 1C7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
    color: '#4285F4',
  },
  {
    id: 'telegram',
    name: 'Telegram Channel',
    category: 'messaging',
    placeholder: 'Channel username e.g. @syncfloww',
    icon: <Send className="w-6 h-6 text-[#26A5E4]" />,
    color: '#26A5E4',
  },
];

interface SocialMediaConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandName: string;
  brandId?: string;
  onConnected?: () => void;
}

export default function SocialMediaConnectDialog({
  open,
  onOpenChange,
  brandName,
  brandId,
  onConnected,
}: SocialMediaConnectDialogProps) {
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [handleInput, setHandleInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visiblePlatforms = showAll ? PLATFORMS : PLATFORMS.slice(0, 9);

  const handleSelectPlatform = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    setHandleInput('');
  };

  const handleOAuthLogin = async (platform: SocialPlatform) => {
    try {
      setIsSubmitting(true);
      if (brandId) {
        const { data } = await apiClient.get(
          `/api/social/oauth/authorize/?provider=${platform.id}&account_type=brand&brand_id=${brandId}`
        );
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
          return;
        }
      }
      // Fallback connect
      await handleDirectConnect(platform);
    } catch {
      await handleDirectConnect(platform);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectConnect = async (platform: SocialPlatform) => {
    const handle = handleInput.trim() || `${brandName.toLowerCase().replace(/\s+/g, '')}_${platform.id}`;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/social/connect/${platform.id}/`, {
        brand_id: brandId,
        username: handle,
      });

      toast({
        title: `Connected ${platform.name}! 🎉`,
        description: `Linked ${handle} to "${brandName}".`,
      });

      setSelectedPlatform(null);
      onOpenChange(false);
      if (onConnected) onConnected();
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.response?.data?.error || 'Could not connect account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setSelectedPlatform(null); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-semibold flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            {selectedPlatform
              ? `Connect ${selectedPlatform.name} to ${brandName}`
              : `Connect Social & Platform Accounts · ${brandName}`}
          </DialogTitle>
        </DialogHeader>

        {selectedPlatform ? (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              {selectedPlatform.icon}
              <div>
                <p className="font-medium text-sm text-foreground">{selectedPlatform.name}</p>
                <p className="text-xs text-muted-foreground">Attach an official channel or account for {brandName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle-input">Account Username / Handle / Email</Label>
              <Input
                id="handle-input"
                placeholder={selectedPlatform.placeholder}
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDirectConnect(selectedPlatform)}
                className="w-full gap-2"
              >
                <Check className="w-4 h-4" />
                {isSubmitting ? 'Linking Account…' : `Link ${selectedPlatform.name} Account`}
              </Button>

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOAuthLogin(selectedPlatform)}
                className="w-full gap-2 text-xs"
              >
                Sign in with {selectedPlatform.name} OAuth
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedPlatform(null)}
                className="w-full text-xs text-muted-foreground"
              >
                Back to platforms
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a social network or Google app to link directly to <span className="font-medium text-foreground">{brandName}</span>:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visiblePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handleSelectPlatform(platform)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent transition-all text-left group"
                >
                  <div className="shrink-0">{platform.icon}</div>
                  <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>

            {!showAll && PLATFORMS.length > 9 && (
              <div className="flex justify-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(true)}
                  className="rounded-full text-xs gap-1"
                >
                  <ChevronDown className="w-4 h-4" /> Load More Apps
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
