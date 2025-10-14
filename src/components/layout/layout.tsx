'use client';

import { useSession } from 'next-auth/react';
import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session || !(session.user as any)?.isValidUser) {
    return <div className="h-full">{children}</div>;
  }

  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}