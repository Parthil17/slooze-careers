'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

const statusVariant: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  DRAFT: 'secondary',
  PLACED: 'warning',
  PAID: 'success',
  CANCELLED: 'destructive' as 'secondary',
};

export default function OrdersPage() {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get<Order[]>('/orders');
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      {isLoading && <p className="text-muted-foreground">Loading orders...</p>}
      {error && <p className="text-destructive">Failed to load orders.</p>}

      {!isLoading && orders.length === 0 && (
        <EmptyState title="No orders" description="Orders in your scope will appear here." />
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block rounded-lg border border-border p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">Order {order.id.slice(0, 8)}...</p>
                <p className="text-sm text-muted-foreground">
                  {order.user?.name ?? 'You'} · {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant[order.status] ?? 'secondary'}>{order.status}</Badge>
                <Badge variant="outline">{order.country}</Badge>
                <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
