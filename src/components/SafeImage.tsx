import React, { useEffect, useMemo, useState } from 'react';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Primary source (usually remote). */
  src: string;
  /** Optional fallback source (usually local). */
  fallbackSrc?: string;
  /** Optional spinner size (Tailwind classes). */
  spinnerSize?: string;
  /** Optional spinner color (Tailwind classes). */
  spinnerColor?: string;
}

const DEFAULT_FALLBACK = '/placeholder.svg';

export function SafeImage({ src, fallbackSrc = DEFAULT_FALLBACK, alt, spinnerSize = 'h-6 w-6', spinnerColor = 'border-current', ...props }: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(fallbackSrc);
  const [loading, setLoading] = useState(false);
  const isRemote = useMemo(() => {
    try {
      const url = new URL(src, window.location.href);
      return url.protocol.startsWith('http');
    } catch {
      return false;
    }
  }, [src]);

  useEffect(() => {
    let canceled = false;
    let loader: HTMLImageElement | null = null;

    const loadRemote = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setCurrentSrc(fallbackSrc);
        setLoading(false);
        return;
      }

      setLoading(true);
      setCurrentSrc(fallbackSrc);

      loader = new Image();
      loader.onload = () => {
        if (!canceled) {
          setCurrentSrc(src);
          setLoading(false);
        }
      };
      loader.onerror = () => {
        if (!canceled) {
          setCurrentSrc(fallbackSrc);
          setLoading(false);
        }
      };
      loader.src = src;
    };

    const setImmediate = () => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setCurrentSrc(fallbackSrc);
        setLoading(false);
        return;
      }

      if (isRemote) {
        loadRemote();
      } else {
        setCurrentSrc(src);
        setLoading(false);
      }
    };

    setImmediate();

    const handleOnline = () => {
      if (isRemote) {
        loadRemote();
      } else {
        setCurrentSrc(src);
        setLoading(false);
      }
    };

    const handleOffline = () => {
      setCurrentSrc(fallbackSrc);
      setLoading(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      canceled = true;
      if (loader) {
        loader.onload = null;
        loader.onerror = null;
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [src, fallbackSrc, isRemote]);

  const handleError = () => {
    // Avoid infinite loops: only switch if we're still trying the remote src
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        loading="lazy"
        {...props}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <div className={`${spinnerSize} rounded-full border-2 ${spinnerColor} border-t-transparent animate-spin`} />
        </div>
      )}
    </div>
  );
}

export default SafeImage;
