import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assets, assetStageTransitions } from '@/domains/assets/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { validateStageTransition } from '@/domains/assets/validation';
import type { AssetStage } from '@/domains/assets/types';

const stageSchema = z.object({
  stage: z.enum([
    'request',
    'business_dd',
    'tech_dd',
    'building_integration',
    'audit',
    'building_bundle',
    'testing',
    'production',
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assetId } = params;
    const body = await request.json();
    const { stage: newStage } = stageSchema.parse(body);

    // Get current asset
    const asset = await db.query.assets.findFirst({
      where: eq(assets.id, assetId),
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const fromStage = asset.currentStage as AssetStage;

    // Validate stage transition
    const validation = await validateStageTransition(assetId, fromStage, newStage);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Update asset stage and record transition
    await db.transaction(async (tx) => {
      await tx
        .update(assets)
        .set({ currentStage: newStage })
        .where(eq(assets.id, assetId));

      await tx.insert(assetStageTransitions).values({
        assetId,
        fromStage,
        toStage: newStage,
        movedByUserId: session.user.id,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating asset stage:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid stage', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}