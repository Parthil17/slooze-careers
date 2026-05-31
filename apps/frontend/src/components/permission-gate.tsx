'use client';

import { Permission } from '@slooze/shared';
import { useAuth } from '@/context/auth-context';

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can } = useAuth();
  if (!can(permission)) return <>{fallback}</>;
  return <>{children}</>;
}
