'use client';

import type { Protocol } from '../types';

interface ProtocolCardProps {
  protocol: Protocol;
  onClick: () => void;
}

export function ProtocolCard({ protocol, onClick }: ProtocolCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {protocol.logoUrl ? (
              <img
                className="h-10 w-10 rounded-full"
                src={protocol.logoUrl}
                alt={`${protocol.name} logo`}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {protocol.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-medium text-gray-900">{protocol.name}</h3>
            {protocol.summary && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{protocol.summary}</p>
            )}
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <p className="text-xs text-gray-500">
          Created {new Date(protocol.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}