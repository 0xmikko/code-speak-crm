import type { LPStatus } from '@/lib/db-types';

export interface LP {
  id: string;
  name: string;
  contactEmail: string | null;
  status: LPStatus;
  notes: string | null;
  createdAt: string;
}

export interface LPContact {
  id: string;
  lpId: string;
  name: string;
  role: string | null;
  phone: string | null;
  telegram: string | null;
  github: string | null;
  avatarUrl: string | null;
}

export interface LPChainAddress {
  id: string;
  lpId: string;
  chainId: number;
  address: string;
  label: string | null;
}

export interface LPWithDetails extends LP {
  contacts: LPContact[];
  chainAddresses: LPChainAddress[];
}

export const LP_STATUS_LABELS: Record<LPStatus, string> = {
  unknown: 'Unknown',
  prospect: 'Prospect',
  active: 'Active',
  paused: 'Paused',
};

export const LP_STATUS_COLORS: Record<LPStatus, string> = {
  unknown: 'bg-gray-100 text-gray-800',
  prospect: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  paused: 'bg-red-100 text-red-800',
};