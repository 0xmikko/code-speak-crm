import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { lps, lpContacts, lpChainAddresses } from '@/domains/lps/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createLPSchema = z.object({
  name: z.string().min(1),
  contactEmail: z.string().email().nullable(),
  status: z.enum(['unknown', 'prospect', 'active', 'paused']),
  notes: z.string().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.query.lps.findMany({
      orderBy: [lps.createdAt],
      with: {
        contacts: {
          orderBy: [lpContacts.name],
        },
        chainAddresses: {
          orderBy: [lpChainAddresses.chainId],
        },
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching LPs:', error);
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
    const validatedData = createLPSchema.parse(body);

    const [newLP] = await db
      .insert(lps)
      .values(validatedData)
      .returning();

    // Return the LP with empty relations
    const result = {
      ...newLP,
      contacts: [],
      chainAddresses: [],
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating LP:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}