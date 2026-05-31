'use client';

import { useAuth } from '@/context/auth-context';
import { PERMISSION_LABELS } from '@/lib/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const { user, permissions } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <span className="text-muted-foreground">Email:</span> {user.email}
          </p>
          <div className="flex gap-2">
            <Badge>{user.role}</Badge>
            <Badge variant="outline">{user.country}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {permissions.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {PERMISSION_LABELS[p]}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
