'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Permission } from '@slooze/shared';
import { api } from '@/lib/api';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/empty-state';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function CartPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const orderId = typeof window !== 'undefined' ? localStorage.getItem('cart_order_id') : null;

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['cart', orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${orderId}`);
      return data;
    },
  });

  const checkout = useMutation({
    mutationFn: async () => {
      await api.post(`/orders/${orderId}/checkout`);
    },
    onSuccess: () => {
      localStorage.removeItem('cart_order_id');
      toast({ title: 'Order placed successfully' });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      refetch();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Checkout failed',
        description: err.response?.data?.message ?? 'You may not have permission',
        variant: 'destructive',
      });
    },
  });

  if (!orderId) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse restaurants and add items to get started."
        />
        <Link href="/restaurants">
          <Button>Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) return <p>Loading cart...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cart</h1>

      {!order || order.status !== 'DRAFT' ? (
        <EmptyState title="No active cart" description="Start a new order from a restaurant." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.length === 0 ? (
              <p className="text-muted-foreground">No items in cart.</p>
            ) : (
              <ul className="space-y-2">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between border-b border-border py-2">
                    <span>
                      {item.menuItem?.name} x{item.quantity}
                    </span>
                    <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between pt-4 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <PermissionGate permission={Permission.CHECKOUT_ORDER}>
              <Button
                className="w-full"
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending || order.items.length === 0}
              >
                {checkout.isPending ? 'Processing...' : 'Checkout'}
              </Button>
            </PermissionGate>
            <p className="text-center text-xs text-muted-foreground">
              Members cannot checkout — contact a manager
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
