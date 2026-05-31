'use client';

import * as React from 'react';

type ToastMessage = { title: string; description?: string; variant?: 'default' | 'destructive' };

const ToastContext = React.createContext<{
  toast: (msg: ToastMessage) => void;
} | null>(null);

export function ToastContextProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<(ToastMessage & { id: number })[]>([]);

  const toast = React.useCallback((msg: ToastMessage) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { ...msg, id }]);
    setTimeout(() => setMessages((prev) => prev.filter((m) => m.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              m.variant === 'destructive'
                ? 'border-destructive bg-destructive/10'
                : 'border-border bg-card'
            }`}
          >
            <p className="font-medium">{m.title}</p>
            {m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastContextProvider');
  return ctx;
}
