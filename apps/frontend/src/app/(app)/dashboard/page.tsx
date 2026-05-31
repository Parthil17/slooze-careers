'use client';

import { useQuery } from '@tanstack/react-query';
import { Permission } from '@slooze/shared';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { PERMISSION_LABELS } from '@/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Order, Restaurant } from '@/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, permissions } = useAuth();

  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data } = await api.get<Restaurant[]>('/restaurants');
      return data;
    },
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get<Order[]>('/orders');
      return data;
    },
  });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Role</CardDescription>
            <CardTitle className="text-lg">{user?.role}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Country Scope</CardDescription>
            <CardTitle className="text-lg">{user?.country}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Restaurants Available</CardDescription>
            <CardTitle className="text-lg">
              {loadingRestaurants ? '...' : restaurants.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              {loadingOrders ? 'Loading...' : `${orders.length} total orders`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <Link href={`/orders/${order.id}`} className="font-medium hover:text-primary">
                        {order.id.slice(0, 8)}...
                      </Link>
                      <p className="text-xs text-muted-foreground">{order.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                      <Badge variant="outline" className="mt-1">
                        {order.country}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permission Summary</CardTitle>
            <CardDescription>Capabilities for your role</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.values(Permission).map((p) => {
                const allowed = permissions.includes(p);
                return (
                  <li key={p} className="flex items-center justify-between text-sm">
                    <span>{PERMISSION_LABELS[p]}</span>
                    <Badge variant={allowed ? 'success' : 'secondary'}>
                      {allowed ? 'Allowed' : 'Denied'}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
