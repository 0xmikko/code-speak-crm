import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { assetIntegrationBuild } from '@/domains/assets/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { buildStatusEnum } from '@/lib/db-types';

const updateIntegrationBuildSchema = z.object({
  buildStatus: z.enum(buildStatusEnum).optional(),
  aiAuditStatus: z.enum(buildStatusEnum).optional(),
  internalAuditStatus: z.enum(buildStatusEnum).optional(),
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
    const validatedData = updateIntegrationBuildSchema.parse(body);

    // Upsert integration build record
    await db
      .insert(assetIntegrationBuild)
      .values({
        assetId,
        ...validatedData,
      })
      .onConflictDoUpdate({
        target: assetIntegrationBuild.assetId,
        set: validatedData,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating integration build:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}