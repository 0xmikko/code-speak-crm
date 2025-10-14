import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/domains/users/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const updateUserSchema = z.object({
  isValidUser: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { isValidUser } = updateUserSchema.parse(body);

    await db
      .update(users)
      .set({ isValidUser })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}