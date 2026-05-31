'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Country, Permission } from '@slooze/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem, Restaurant } from '@/types';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const { data } = await api.get<Restaurant>(`/restaurants/${id}`);
      return data;
    },
  });

  const addToCart = useMutation({
    mutationFn: async (item: MenuItem) => {
      let orderId: string | null = localStorage.getItem('cart_order_id');
      const country = (restaurant?.country ?? user?.country) as Country;

      if (!orderId) {
        const { data: order } = await api.post<{ id: string }>('/orders', { country });
        orderId = order.id;
        localStorage.setItem('cart_order_id', orderId);
      }

      await api.post(`/orders/${orderId}/items`, {
        menuItemId: item.id,
        quantity: 1,
      });
      return orderId;
    },
    onSuccess: () => {
      toast({ title: 'Added to cart' });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast({
        title: 'Could not add item',
        description: err.response?.data?.message ?? 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!restaurant) return <p className="text-destructive">Restaurant not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline" className="mb-2">
          {restaurant.country}
        </Badge>
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
        <p className="text-muted-foreground">{restaurant.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {restaurant.menuItems?.map((item) => (
          <Card key={item.id}>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-40 w-full rounded-t-lg object-cover"
              />
            )}
            <CardHeader>
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="font-semibold">{formatCurrency(item.price)}</span>
              <Button
                size="sm"
                onClick={() => addToCart.mutate(item)}
                disabled={addToCart.isPending}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
