'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import type { Protocol } from '../types';
import { ProtocolCard } from './protocol-card';
import { CreateProtocolModal } from './create-protocol-modal';
import { useState } from 'react';

interface ProtocolGridProps {
  protocols: Protocol[];
  onProtocolClick: (protocol: Protocol) => void;
  onCreateProtocol: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => Promise<boolean>;
}

export function ProtocolGrid({ protocols, onProtocolClick, onCreateProtocol }: ProtocolGridProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateProtocol = async (protocolData: Omit<Protocol, 'id' | 'createdAt'>) => {
    const success = await onCreateProtocol(protocolData);
    if (success) {
      setIsCreateModalOpen(false);
    }
    return success;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Protocols</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add Protocol
        </button>
      </div>

      {/* Protocol Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {protocols.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No protocols</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new protocol.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Add Protocol
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {protocols.map((protocol) => (
              <ProtocolCard
                key={protocol.id}
                protocol={protocol}
                onClick={() => onProtocolClick(protocol)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Protocol Modal */}
      <CreateProtocolModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProtocol}
      />
    </div>
  );
}