import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/online - Count users active in last 5 minutes
export async function GET() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const count = await prisma.user.count({
    where: { lastActiveAt: { gte: fiveMinutesAgo } }
  });

  return NextResponse.json({ count });
}

// POST /api/online - Update user's lastActiveAt
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { username } = body;

  if (username) {
    await prisma.user.update({
      where: { username: username.toLowerCase() },
      data: { lastActiveAt: new Date() }
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
