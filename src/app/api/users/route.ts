import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/domains/users/schema';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !(session.user as any).isValidUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        isValidUser: users.isValidUser,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}