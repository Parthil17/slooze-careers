'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem } from '@/types';

export default function MenuListingPage() {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data } = await api.get<MenuItem[]>('/menu-items');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu</h1>
      <p className="text-muted-foreground">All menu items in your country scope</p>

      {isLoading && <p className="text-muted-foreground">Loading menu...</p>}
      {error && <p className="text-destructive">Failed to load menu items.</p>}

      {!isLoading && items.length === 0 && (
        <EmptyState title="No menu items" description="No items available in your region." />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border p-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-semibold">{item.name}</h3>
              <Badge variant="outline">{item.restaurant?.country}</Badge>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">{item.description}</p>
            <p className="mb-2 font-medium">{formatCurrency(item.price)}</p>
            {item.restaurant && (
              <Link
                href={`/restaurants/${item.restaurantId}`}
                className="text-sm text-primary hover:underline"
              >
                {item.restaurant.name}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
