import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import CustomersTable from '@/components/CustomersTable';

interface Brand { id: string; name: string }

export default function Customers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>('all');

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    apiClient.get('/api/social/brands/')
      .then(({ data }) => setBrands(Array.isArray(data) ? data : []))
      .catch(() => setBrands([]));
  }, [user, navigate]);

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Everyone who reached out — across every channel.
            </p>
          </div>
        </div>
        {brands.length > 0 && (
          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by brand" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All brands</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </header>

      <CustomersTable brandId={brandId === 'all' ? undefined : brandId} />
    </div>
  );
}
