import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { protocols, protocolContacts } from '@/domains/protocols/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const protocol = await db.query.protocols.findFirst({
      where: eq(protocols.id, id),
    });

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    const contacts = await db.query.protocolContacts.findMany({
      where: eq(protocolContacts.protocolId, id),
      orderBy: protocolContacts.createdAt,
    });

    const result = {
      ...protocol,
      contacts,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching protocol:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}