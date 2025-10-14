import { db } from '@/lib/db';
import {
  assetBusinessDD,
  assetTechDD,
  assetIntegrationBuild,
  assetRequestFields
} from './schema';
import { eq, and } from 'drizzle-orm';
import type { AssetStage } from './types';

export async function validateStageTransition(
  assetId: string,
  fromStage: AssetStage,
  toStage: AssetStage
): Promise<{ valid: boolean; error?: string }> {
  // Allow backward transitions without validation
  const stageOrder: AssetStage[] = [
    'request',
    'business_dd',
    'tech_dd',
    'building_integration',
    'audit',
    'building_bundle',
    'testing',
    'production',
  ];

  const fromIndex = stageOrder.indexOf(fromStage);
  const toIndex = stageOrder.indexOf(toStage);

  if (toIndex <= fromIndex) {
    return { valid: true }; // Backward moves are always allowed
  }

  // Validate forward transitions based on stage gating rules
  switch (toStage) {
    case 'business_dd': {
      // Request → Business DD: all request fields present and valid
      const requestFields = await db.query.assetRequestFields.findFirst({
        where: eq(assetRequestFields.assetId, assetId),
      });

      if (!requestFields) {
        return { valid: false, error: 'Request fields are required' };
      }

      if (!requestFields.assetSymbol || !requestFields.assetAddress || !requestFields.chainId || !requestFields.source) {
        return { valid: false, error: 'All request fields must be completed' };
      }

      return { valid: true };
    }

    case 'tech_dd': {
      // Business DD → Tech DD: at least one interested curator
      const businessDD = await db.query.assetBusinessDD.findFirst({
        where: eq(assetBusinessDD.assetId, assetId),
      });

      if (!businessDD || !businessDD.interestedCuratorIds || businessDD.interestedCuratorIds.length === 0) {
        return { valid: false, error: 'At least one interested curator must be linked' };
      }

      return { valid: true };
    }

    case 'building_integration': {
      // Tech DD → Building integration: booleans set and developer assigned if needed
      const techDD = await db.query.assetTechDD.findFirst({
        where: eq(assetTechDD.assetId, assetId),
      });

      if (!techDD) {
        return { valid: false, error: 'Technical due diligence fields are required' };
      }

      // Check if any technical work is needed
      if (techDD.priceOracleNeeded || techDD.adapterNeeded || techDD.phantomTokenNeeded) {
        if (!techDD.developerUserId) {
          return { valid: false, error: 'Developer must be assigned when technical work is needed' };
        }
      }

      return { valid: true };
    }

    case 'audit': {
      // Building integration → Audit: all build statuses must be done
      const integrationBuild = await db.query.assetIntegrationBuild.findFirst({
        where: eq(assetIntegrationBuild.assetId, assetId),
      });

      if (!integrationBuild) {
        return { valid: false, error: 'Integration build fields are required' };
      }

      if (integrationBuild.buildStatus !== 'done' ||
          integrationBuild.aiAuditStatus !== 'done' ||
          integrationBuild.internalAuditStatus !== 'done') {
        return { valid: false, error: 'All build and audit statuses must be completed' };
      }

      return { valid: true };
    }

    case 'building_bundle':
    case 'testing':
    case 'production': {
      // No additional validation required for v1
      return { valid: true };
    }

    default:
      return { valid: false, error: 'Invalid stage transition' };
  }
}