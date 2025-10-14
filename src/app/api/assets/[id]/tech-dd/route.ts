import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assetTechDD } from '@/domains/assets/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateTechDDSchema = z.object({
  priceOracleNeeded: z.boolean().optional(),
  adapterNeeded: z.boolean().optional(),
  phantomTokenNeeded: z.boolean().optional(),
  developerUserId: z.string().uuid().nullable().optional(),
  auditEta: z.string().datetime().nullable().optional(),
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
    const validatedData = updateTechDDSchema.parse(body);

    // Convert auditEta string to Date if provided
    const processedData = {
      ...validatedData,
      auditEta: validatedData.auditEta ? new Date(validatedData.auditEta) : undefined,
    };

    // Upsert tech DD record
    await db
      .insert(assetTechDD)
      .values({
        assetId,
        ...processedData,
      })
      .onConflictDoUpdate({
        target: assetTechDD.assetId,
        set: processedData,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tech DD:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}