import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assets } from '@/domains/assets/schema';
import { protocols } from '@/domains/protocols/schema';
import { like, or, eq } from 'drizzle-orm';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ assets: [], protocols: [] });
    }

    const { query: validatedQuery } = searchSchema.parse({ query: query.trim() });
    const searchTerm = `%${validatedQuery.toLowerCase()}%`;

    // Search assets by symbol
    const assetResults = await db
      .select({
        id: assets.id,
        title: assets.assetSymbol,
        subtitle: assets.assetAddress,
        currentStage: assets.currentStage,
      })
      .from(assets)
      .where(
        or(
          like(assets.assetSymbol, searchTerm),
          like(assets.assetAddress, searchTerm)
        )
      )
      .limit(5);

    // Search protocols by name
    const protocolResults = await db
      .select({
        id: protocols.id,
        title: protocols.name,
        subtitle: protocols.summary,
      })
      .from(protocols)
      .where(like(protocols.name, searchTerm))
      .limit(5);

    return NextResponse.json({
      assets: assetResults.map(asset => ({ ...asset, type: 'asset' as const })),
      protocols: protocolResults.map(protocol => ({ ...protocol, type: 'protocol' as const })),
    });
  } catch (error) {
    console.error('Error searching:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search query', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}