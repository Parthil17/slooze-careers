'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/empty-state';
import type { Restaurant } from '@/types';

export default function RestaurantsPage() {
  const { data: restaurants = [], isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data } = await api.get<Restaurant[]>('/restaurants');
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Loading restaurants...</p>;
  if (error) return <p className="text-destructive">Failed to load restaurants.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Restaurants</h1>
        <p className="text-muted-foreground">Browse venues available in your country scope</p>
      </div>

      {restaurants.length === 0 ? (
        <EmptyState title="No restaurants" description="No restaurants match your access scope." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {restaurants.map((r) => (
            <Link key={r.id} href={`/restaurants/${r.id}`}>
              <Card className="h-full transition-colors hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{r.name}</CardTitle>
                    <Badge variant="outline">{r.country}</Badge>
                  </div>
                  <CardDescription>{r.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {r.menuItems?.length ?? 0} menu items
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
