import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brandsListQuery } from '@/features/brands/queries';
import type { Brand } from '@/features/brands/api';
import { useWorkspace } from './WorkspaceContext';

interface BrandContextValue {
  brands: Brand[];
  activeBrand: Brand | null;
  activeBrandId: string | null;
  setActiveBrandId: (id: string) => void;
  isLoading: boolean;
}

const BrandContext = createContext<BrandContextValue | undefined>(undefined);
const STORAGE_KEY = 'syncflow-active-brand';

export function BrandProvider({ children }: { children: ReactNode }) {
  const { activeWorkspaceId } = useWorkspace();
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);

  const { data: brands = [], isLoading } = useQuery(brandsListQuery(activeWorkspaceId || ''));

  useEffect(() => {
    if (!brands.length) {
      setActiveBrandIdState(null);
      return;
    }
    const key = `${STORAGE_KEY}-${activeWorkspaceId}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const exists = stored && brands.find((b) => b.id === stored);
    setActiveBrandIdState(exists ? stored! : brands[0].id);
  }, [brands, activeWorkspaceId]);

  const setActiveBrandId = (id: string) => {
    localStorage.setItem(`${STORAGE_KEY}-${activeWorkspaceId}`, id);
    setActiveBrandIdState(id);
  };

  const activeBrand = useMemo(
    () => brands.find((b) => b.id === activeBrandId) || null,
    [brands, activeBrandId],
  );

  return (
    <BrandContext.Provider
      value={{ brands, activeBrand, activeBrandId, setActiveBrandId, isLoading }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within BrandProvider');
  return ctx;
}
