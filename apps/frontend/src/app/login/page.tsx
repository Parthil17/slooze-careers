'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const DEMO_USERS = [
  { email: 'nick.fury@slooze.com', role: 'ADMIN' },
  { email: 'captain.marvel@slooze.com', role: 'MANAGER (India)' },
  { email: 'captain.america@slooze.com', role: 'MANAGER (America)' },
  { email: 'thanos@slooze.com', role: 'MEMBER (India)' },
  { email: 'travis@slooze.com', role: 'MEMBER (America)' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('nick.fury@slooze.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
      toast({ title: 'Welcome back!' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } }; code?: string };
      const isNetwork =
        axiosErr.code === 'ERR_NETWORK' || axiosErr.code === 'ECONNREFUSED' || !axiosErr.response;
      toast({
        title: 'Login failed',
        description: isNetwork
          ? 'Cannot reach API. Start the backend: cd apps/backend && npm run dev'
          : (axiosErr.response?.data?.message ?? 'Invalid email or password'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Slooze Food Ordering</CardTitle>
          <CardDescription>Sign in with your enterprise account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div>
              <label className="mb-1 block text-sm">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-6">
            <p className="mb-2 text-xs text-muted-foreground">Demo accounts (password: Password123!)</p>
            <div className="flex flex-wrap gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
                  onClick={() => setEmail(u.email)}
                >
                  {u.role}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
