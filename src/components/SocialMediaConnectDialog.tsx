import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, Globe, Calendar, Send } from 'lucide-react';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const platforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: (
      <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: '#1877F2',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: (
      <svg className="w-6 h-6" fill="#0A66C2" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: '#0A66C2',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: <Send className="w-6 h-6 text-[#26A5E4]" />,
    color: '#26A5E4',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: (
      <svg className="w-6 h-6" fill="#E4405F" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    color: '#E4405F',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: (
      <svg className="w-6 h-6" fill="#FFFC00" viewBox="0 0 24 24">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.256.14-.07.257-.127.392-.127.176 0 .322.055.427.164a.544.544 0 01.152.4c-.013.182-.14.348-.384.51-.166.11-.32.2-.541.309l-.107.058c-.272.144-.578.307-.716.488a.637.637 0 00-.1.373c0 .036.008.073.015.117.095.587.241 1.186.394 1.71.296 1.012.694 1.735 1.219 2.214a5.015 5.015 0 001.718 1.1c.126.052.213.118.255.197.045.084.036.18-.024.282-.104.175-.34.316-.684.42-.446.132-.997.198-1.39.249-.166.023-.313.041-.423.065a.88.88 0 00-.201.092c-.05.06-.1.194-.15.389l-.004.012c-.051.194-.107.412-.245.59-.22.281-.546.383-.856.383-.215 0-.43-.044-.623-.12-.279-.11-.551-.25-.83-.3a5.3 5.3 0 00-.88-.082c-.264 0-.494.024-.66.06-.328.073-.625.205-.93.34-.422.19-.864.385-1.47.385h-.046c-.608 0-1.05-.196-1.474-.386-.302-.135-.6-.266-.928-.339a3.7 3.7 0 00-.66-.06 5.28 5.28 0 00-.878.082c-.28.051-.553.19-.832.3a1.86 1.86 0 01-.623.12c-.394 0-.743-.165-.877-.4-.14-.178-.196-.397-.248-.594l-.001-.009c-.048-.19-.1-.33-.158-.397a.68.68 0 00-.178-.083 4.34 4.34 0 00-.42-.065c-.39-.05-.94-.117-1.384-.249-.394-.12-.594-.26-.694-.431-.055-.1-.06-.19-.018-.278.039-.078.13-.146.255-.198a5.013 5.013 0 001.718-1.1c.525-.479.923-1.202 1.22-2.214.152-.524.298-1.123.393-1.71.007-.044.014-.08.014-.117a.634.634 0 00-.1-.373c-.137-.181-.443-.344-.715-.488l-.107-.058a6.89 6.89 0 01-.541-.31c-.243-.16-.371-.327-.384-.508a.544.544 0 01.152-.4.509.509 0 01.427-.165c.135 0 .253.058.392.128.264.136.622.24.922.256.196 0 .325-.045.4-.09a11.05 11.05 0 01-.032-.57c-.104-1.627-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793z" />
      </svg>
    ),
    color: '#FFFC00',
  },
  {
    id: 'youtube',
    name: 'Youtube',
    icon: (
      <svg className="w-6 h-6" fill="#FF0000" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: '#FF0000',
  },
  {
    id: 'tiktok',
    name: 'Tiktok',
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
    id: 'website',
    name: 'Website (Wordpress)',
    icon: <Globe className="w-6 h-6 text-muted-foreground" />,
    color: '#666',
  },
  {
    id: 'x-twitter',
    name: 'X (formerly Twitter)',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: '#000',
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: <Calendar className="w-6 h-6 text-muted-foreground" />,
    color: '#666',
  },
];

interface SocialMediaConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandName: string;
}

export default function SocialMediaConnectDialog({
  open,
  onOpenChange,
  brandName,
}: SocialMediaConnectDialogProps) {
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  const visiblePlatforms = showAll ? platforms : platforms.slice(0, 9);

  const handleConnect = (platform: SocialPlatform) => {
    toast({
      title: `Connecting ${platform.name}`,
      description: `${platform.name} integration for "${brandName}" will be available soon.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-lg font-medium">
            Pick a Social Media to begin.
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {visiblePlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleConnect(platform)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
            >
              {platform.icon}
              <span className="text-sm font-medium text-muted-foreground">
                {platform.name}
              </span>
            </button>
          ))}
        </div>

        {!showAll && platforms.length > 9 && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(true)}
              className="rounded-full"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              Load more
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
