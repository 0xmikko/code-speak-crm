'use client';

import type { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{asset.assetSymbol}</h4>
          {asset.protocolName && (
            <p className="text-sm text-gray-600">{asset.protocolName}</p>
          )}
          <p className="text-xs text-gray-500">Chain ID: {asset.chainId}</p>
        </div>
        <div className="ml-2 flex-shrink-0">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            asset.source === 'partner'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {asset.source}
          </span>
        </div>
      </div>

      <div className="mt-3">
        {asset.ownerName && (
          <p className="text-xs text-gray-500">
            Assigned to: <span className="font-medium">{asset.ownerName}</span>
          </p>
        )}
        <p className="text-xs text-gray-400 truncate">
          {asset.assetAddress}
        </p>
      </div>
    </div>
  );
}