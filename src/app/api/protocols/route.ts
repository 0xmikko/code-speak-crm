import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { protocols } from '@/domains/protocols/schema';
import { z } from 'zod';

const createProtocolSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().url().nullable(),
  summary: z.string().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select()
      .from(protocols)
      .orderBy(protocols.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching protocols:', error);
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
    const validatedData = createProtocolSchema.parse(body);

    const [newProtocol] = await db
      .insert(protocols)
      .values(validatedData)
      .returning();

    return NextResponse.json(newProtocol, { status: 201 });
  } catch (error) {
    console.error('Error creating protocol:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}