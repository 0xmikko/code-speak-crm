'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { KanbanBoard } from '@/domains/assets/components/kanban-board';
import { AssetDetailsDrawer } from '@/domains/assets/components/asset-details-drawer';
import type { Asset, AssetStage } from '@/domains/assets/types';

export default function AssetsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (session && !(session.user as any)?.isValidUser) {
      router.push('/');
      return;
    }
    loadAssets();
  }, [session, router]);

  const loadAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (assetId: string, newStage: AssetStage): Promise<boolean> => {
    try {
      const response = await fetch(`/api/assets/${assetId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (response.ok) {
        await loadAssets(); // Refresh data
        toast.success('Asset moved successfully');
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to move asset');
        return false;
      }
    } catch (error) {
      console.error('Error changing stage:', error);
      toast.error('Failed to move asset');
      return false;
    }
  };

  const handleCreateAsset = async (assetData: Omit<Asset, 'id' | 'createdAt' | 'currentStage'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (response.ok) {
        await loadAssets(); // Refresh data
        toast.success('Asset created successfully');
        return true;
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create asset');
        return false;
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      toast.error('Failed to create asset');
      return false;
    }
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleAssetUpdate = async (updatedAsset: Asset) => {
    await loadAssets(); // Refresh data
    setSelectedAsset(updatedAsset);
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading assets...</div>;
  }

  return (
    <>
      <KanbanBoard
        assets={assets}
        onStageChange={handleStageChange}
        onAssetClick={handleAssetClick}
        onCreateAsset={handleCreateAsset}
      />
      {selectedAsset && (
        <AssetDetailsDrawer
          asset={selectedAsset}
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={handleAssetUpdate}
        />
      )}
    </>
  );
}