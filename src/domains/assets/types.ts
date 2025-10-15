import type { AssetStage, AssetSource } from '@/lib/db-types';

// Re-export types for convenience
export type { AssetStage, AssetSource } from '@/lib/db-types';

export interface Asset {
  id: string;
  assetSymbol: string;
  assetAddress: string;
  chainId: number;
  protocolId: string | null;
  protocolName?: string;
  source: AssetSource;
  currentStage: AssetStage;
  ownerUserId: string | null;
  ownerName?: string;
  createdAt: string;
}

export interface AssetCard {
  id: string;
  content: Asset;
}

export interface KanbanColumn {
  id: AssetStage;
  title: string;
  cards: AssetCard[];
}

export const STAGE_LABELS: Record<AssetStage, string> = {
  request: 'Request',
  business_dd: 'Business DD',
  tech_dd: 'Tech DD',
  building_integration: 'Building Integration',
  audit: 'Audit',
  building_bundle: 'Building Bundle',
  testing: 'Testing',
  production: 'Production',
};

export const STAGES: AssetStage[] = [
  'request',
  'business_dd',
  'tech_dd',
  'building_integration',
  'audit',
  'building_bundle',
  'testing',
  'production',
];