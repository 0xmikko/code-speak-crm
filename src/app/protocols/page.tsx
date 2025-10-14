'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ProtocolGrid } from '@/domains/protocols/components/protocol-grid';
import { ProtocolDetailsDrawer } from '@/domains/protocols/components/protocol-details-drawer';
import type { Protocol, ProtocolWithContacts } from '@/domains/protocols/types';

export default function ProtocolsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolWithContacts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && !(session.user as any)?.isValidUser) {
      router.push('/');
      return;
    }
    loadProtocols();
  }, [session, router]);

  const loadProtocols = async () => {
    try {
      const response = await fetch('/api/protocols');
      if (response.ok) {
        const data = await response.json();
        setProtocols(data);
      }
    } catch (error) {
      console.error('Error loading protocols:', error);
      toast.error('Failed to load protocols');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProtocol = async (protocolData: Omit<Protocol, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/protocols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(protocolData),
      });

      if (response.ok) {
        await loadProtocols(); // Refresh data
        toast.success('Protocol created successfully');
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create protocol');
        return false;
      }
    } catch (error) {
      console.error('Error creating protocol:', error);
      toast.error('Failed to create protocol');
      return false;
    }
  };

  const handleProtocolClick = async (protocol: Protocol) => {
    try {
      const response = await fetch(`/api/protocols/${protocol.id}`);
      if (response.ok) {
        const protocolWithContacts = await response.json();
        setSelectedProtocol(protocolWithContacts);
      }
    } catch (error) {
      console.error('Error loading protocol details:', error);
      toast.error('Failed to load protocol details');
    }
  };

  const handleProtocolUpdate = async (updatedProtocol: ProtocolWithContacts) => {
    // Update the protocol in the local list
    setProtocols(prev =>
      prev.map(p => p.id === updatedProtocol.id ? updatedProtocol : p)
    );
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading protocols...</div>;
  }

  return (
    <>
      <ProtocolGrid
        protocols={protocols}
        onProtocolClick={handleProtocolClick}
        onCreateProtocol={handleCreateProtocol}
      />
      <ProtocolDetailsDrawer
        protocol={selectedProtocol}
        isOpen={!!selectedProtocol}
        onClose={() => setSelectedProtocol(null)}
        onUpdate={handleProtocolUpdate}
      />
    </>
  );
}