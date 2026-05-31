'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Permission } from '@slooze/shared';
import { api } from '@/lib/api';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import type { Order, PaymentMethod } from '@/types';
import { useState } from 'react';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [paymentMethodId, setPaymentMethodId] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${id}`);
      return data;
    },
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await api.get<PaymentMethod[]>('/payment-methods');
      return data;
    },
    enabled: order?.status === 'PLACED',
  });

  const cancelOrder = useMutation({
    mutationFn: () => api.patch(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast({ title: 'Order cancelled' });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: () => toast({ title: 'Cancel failed', variant: 'destructive' }),
  });

  const payOrder = useMutation({
    mutationFn: () =>
      api.post('/payments', { orderId: id, paymentMethodId }),
    onSuccess: () => {
      toast({ title: 'Payment successful' });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Payment failed',
        description: err.response?.data?.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (!order) return <p className="text-destructive">Order not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Badge>{order.status}</Badge>
        <Badge variant="outline">{order.country}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.menuItem?.name} x{item.quantity}
                </span>
                <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-right text-xl font-bold">
            Total: {formatCurrency(order.totalAmount)}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <PermissionGate permission={Permission.CANCEL_ORDER}>
          {order.status !== 'CANCELLED' && order.status !== 'PAID' && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Cancel this order?')) cancelOrder.mutate();
              }}
              disabled={cancelOrder.isPending}
            >
              Cancel Order
            </Button>
          )}
        </PermissionGate>

        <PermissionGate permission={Permission.PAY_ORDER}>
          {order.status === 'PLACED' && (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="mb-1 block text-sm">Payment Method</label>
                <select
                  className="h-10 rounded-md border border-input bg-background px-3"
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                >
                  <option value="">Select card</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.cardHolder} - {pm.cardNumberMasked}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => payOrder.mutate()}
                disabled={!paymentMethodId || payOrder.isPending}
              >
                Pay Order
              </Button>
            </div>
          )}
        </PermissionGate>
      </div>
    </div>
  );
}
