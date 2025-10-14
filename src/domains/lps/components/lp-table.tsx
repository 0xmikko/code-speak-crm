'use client';

import { useState } from 'react';
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { LPWithDetails } from '../types';
import { LP_STATUS_LABELS, LP_STATUS_COLORS } from '../types';
import { CreateLPModal } from './create-lp-modal';
import { LPDetailsRow } from './lp-details-row';

interface LPTableProps {
  lps: LPWithDetails[];
  onCreateLP: (lp: Omit<LPWithDetails, 'id' | 'createdAt' | 'contacts' | 'chainAddresses'>) => Promise<boolean>;
  onUpdateLP: (lp: LPWithDetails) => Promise<void>;
}

export function LPTable({ lps, onCreateLP, onUpdateLP }: LPTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleRowExpansion = (lpId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(lpId)) {
      newExpanded.delete(lpId);
    } else {
      newExpanded.add(lpId);
    }
    setExpandedRows(newExpanded);
  };

  const handleCreateLP = async (lpData: Omit<LPWithDetails, 'id' | 'createdAt' | 'contacts' | 'chainAddresses'>) => {
    const success = await onCreateLP(lpData);
    if (success) {
      setIsCreateModalOpen(false);
    }
    return success;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Liquidity Providers</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add LP
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {lps.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No liquidity providers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new LP.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                Add LP
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Contact Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Addresses
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Expand</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lps.map((lp) => (
                  <>
                    <tr key={lp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{lp.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LP_STATUS_COLORS[lp.status]}`}>
                          {LP_STATUS_LABELS[lp.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{lp.contactEmail || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {lp.chainAddresses.length} chain{lp.chainAddresses.length !== 1 ? 's' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleRowExpansion(lp.id)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {expandedRows.has(lp.id) ? (
                            <ChevronDownIcon className="h-5 w-5" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows.has(lp.id) && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <LPDetailsRow lp={lp} onUpdate={onUpdateLP} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create LP Modal */}
      <CreateLPModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateLP}
      />
    </div>
  );
}