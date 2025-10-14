'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { LPTable } from '@/domains/lps/components/lp-table';
import type { LPWithDetails } from '@/domains/lps/types';

export default function LPsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [lps, setLps] = useState<LPWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && !(session.user as any)?.isValidUser) {
      router.push('/');
      return;
    }
    loadLPs();
  }, [session, router]);

  const loadLPs = async () => {
    try {
      const response = await fetch('/api/lps');
      if (response.ok) {
        const data = await response.json();
        setLps(data);
      }
    } catch (error) {
      console.error('Error loading LPs:', error);
      toast.error('Failed to load LPs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLP = async (lpData: Omit<LPWithDetails, 'id' | 'createdAt' | 'contacts' | 'chainAddresses'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/lps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lpData),
      });

      if (response.ok) {
        await loadLPs(); // Refresh data
        toast.success('LP created successfully');
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create LP');
        return false;
      }
    } catch (error) {
      console.error('Error creating LP:', error);
      toast.error('Failed to create LP');
      return false;
    }
  };

  const handleUpdateLP = async (updatedLP: LPWithDetails) => {
    // Update the LP in the local list
    setLps(prev =>
      prev.map(lp => lp.id === updatedLP.id ? updatedLP : lp)
    );
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading LPs...</div>;
  }

  return (
    <LPTable
      lps={lps}
      onCreateLP={handleCreateLP}
      onUpdateLP={handleUpdateLP}
    />
  );
}