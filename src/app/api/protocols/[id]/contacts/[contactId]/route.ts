import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { protocolContacts } from '@/domains/protocols/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; contactId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId } = params;

    await db
      .delete(protocolContacts)
      .where(eq(protocolContacts.id, contactId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}