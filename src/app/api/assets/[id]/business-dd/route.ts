import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assetBusinessDD } from '@/domains/assets/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateBusinessDDSchema = z.object({
  notes: z.string().nullable(),
  interestedCuratorIds: z.array(z.string().uuid()).optional(),
});

export async function PUT(
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
    const validatedData = updateBusinessDDSchema.parse(body);

    // Upsert business DD record
    await db
      .insert(assetBusinessDD)
      .values({
        assetId,
        ...validatedData,
      })
      .onConflictDoUpdate({
        target: assetBusinessDD.assetId,
        set: validatedData,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating business DD:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}