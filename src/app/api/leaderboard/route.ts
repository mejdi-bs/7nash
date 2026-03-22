import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/leaderboard - Get top players
export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

  const players = await prisma.user.findMany({
    orderBy: { highScore: 'desc' },
    take: limit,
    select: {
      username: true,
      highScore: true,
      selectedSkin: true
    }
  });

  return NextResponse.json(players);
}
