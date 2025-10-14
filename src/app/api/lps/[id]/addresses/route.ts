import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { lpChainAddresses } from '@/domains/lps/schema';
import { z } from 'zod';

const createAddressSchema = z.object({
  chainId: z.number().int().positive(),
  address: z.string().min(1),
  label: z.string().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: lpId } = params;
    const body = await request.json();
    const validatedData = createAddressSchema.parse(body);

    const [newAddress] = await db
      .insert(lpChainAddresses)
      .values({
        ...validatedData,
        lpId,
      })
      .returning();

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}