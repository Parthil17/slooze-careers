'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Permission } from '@slooze/shared';
import { api } from '@/lib/api';
import { PermissionGate } from '@/components/permission-gate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/empty-state';
import { useToast } from '@/hooks/use-toast';
import type { PaymentMethod } from '@/types';
import { useState } from 'react';

export default function PaymentMethodsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await api.get<PaymentMethod[]>('/payment-methods');
      return data;
    },
  });

  const updateMethod = useMutation({
    mutationFn: ({ id, cardHolder, expiryDate }: { id: string; cardHolder: string; expiryDate: string }) =>
      api.patch(`/payment-methods/${id}`, { cardHolder, expiryDate }),
    onSuccess: () => {
      toast({ title: 'Payment method updated' });
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Methods</h1>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && methods.length === 0 && (
        <EmptyState title="No payment methods" description="Payment methods are created at signup." />
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {methods.map((pm) => (
          <Card key={pm.id}>
            <CardHeader>
              <CardTitle className="text-lg">{pm.cardHolder}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-mono text-sm">{pm.cardNumberMasked}</p>
              <p className="text-sm text-muted-foreground">Expires {pm.expiryDate}</p>

              <PermissionGate permission={Permission.UPDATE_PAYMENT_METHOD}>
                {editId === pm.id ? (
                  <div className="space-y-2 pt-2">
                    <Input
                      placeholder="Card holder"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                    <Input
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMethod.mutate({ id: pm.id, cardHolder, expiryDate })
                        }
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditId(pm.id);
                      setCardHolder(pm.cardHolder);
                      setExpiryDate(pm.expiryDate);
                    }}
                  >
                    Update Payment Method
                  </Button>
                )}
              </PermissionGate>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
