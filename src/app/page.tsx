'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user && (session.user as any).isValidUser) {
      router.push('/assets');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Decentralized Protocol CRM
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Manage protocol assets, LPs, and integrations
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <Link
                href="/auth/signin"
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!(session.user as any).isValidUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Access Pending
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your account is being reviewed. An admin will enable your access soon.
            </p>
            <p className="mt-4 text-center text-xs text-gray-500">
              Signed in as {session.user.email}
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div>
              <button
                onClick={() => router.push('/auth/signout')}
                className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}