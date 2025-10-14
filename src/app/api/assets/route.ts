import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assets, assetRequestFields } from '@/domains/assets/schema';
import { protocols } from '@/domains/protocols/schema';
import { users } from '@/domains/users/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const createAssetSchema = z.object({
  assetSymbol: z.string().min(1),
  assetAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number().int().positive(),
  protocolId: z.string().uuid().nullable(),
  source: z.enum(['partner', 'analyst']),
  ownerUserId: z.string().uuid().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select({
        id: assets.id,
        assetSymbol: assets.assetSymbol,
        assetAddress: assets.assetAddress,
        chainId: assets.chainId,
        protocolId: assets.protocolId,
        protocolName: protocols.name,
        source: assets.source,
        currentStage: assets.currentStage,
        ownerUserId: assets.ownerUserId,
        ownerName: users.name,
        createdAt: assets.createdAt,
      })
      .from(assets)
      .leftJoin(protocols, eq(assets.protocolId, protocols.id))
      .leftJoin(users, eq(assets.ownerUserId, users.id))
      .orderBy(assets.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAssetSchema.parse(body);

    // Check for duplicate (chainId, assetAddress)
    const existingAsset = await db.query.assets.findFirst({
      where: sql`${assets.chainId} = ${validatedData.chainId} AND ${assets.assetAddress} = ${validatedData.assetAddress}`,
    });

    if (existingAsset) {
      return NextResponse.json(
        { error: 'Asset with this address already exists on this chain' },
        { status: 400 }
      );
    }

    // Create asset and request fields in a transaction
    const result = await db.transaction(async (tx) => {
      const [newAsset] = await tx
        .insert(assets)
        .values({
          ...validatedData,
          currentStage: 'request',
        })
        .returning();

      await tx.insert(assetRequestFields).values({
        assetId: newAsset.id,
        ...validatedData,
      });

      return newAsset;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}