import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/stats - Get site stats (unique players)
export async function GET() {
  const stats = await prisma.siteStats.findUnique({ where: { id: 'site-stats' } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Count unique players today
  const todayPlayers = await prisma.dailyPlayerVisit.count({
    where: { date: today }
  });

  return NextResponse.json({
    totalPlayers: stats?.totalPlayers || 0,
    todayPlayers
  });
}

// POST /api/stats - Record player visit (unique per day)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { username } = body;

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if player already visited today
  const existingVisit = await prisma.dailyPlayerVisit.findUnique({
    where: {
      date_username: { date: today, username: username.toLowerCase() }
    }
  });

  if (existingVisit) {
    // Already counted today
    const stats = await prisma.siteStats.findUnique({ where: { id: 'site-stats' } });
    const todayPlayers = await prisma.dailyPlayerVisit.count({ where: { date: today } });
    return NextResponse.json({ totalPlayers: stats?.totalPlayers || 0, todayPlayers, isNew: false });
  }

  // First visit today - record it
  await prisma.dailyPlayerVisit.create({
    data: { date: today, username: username.toLowerCase() }
  });

  // Check if this is first visit ever (for totalPlayers)
  const previousVisits = await prisma.dailyPlayerVisit.count({
    where: { username: username.toLowerCase() }
  });

  let totalPlayers = 0;
  if (previousVisits === 1) {
    // First time ever - increment total
    const stats = await prisma.siteStats.upsert({
      where: { id: 'site-stats' },
      update: { totalPlayers: { increment: 1 } },
      create: { id: 'site-stats', totalPlayers: 1 }
    });
    totalPlayers = stats.totalPlayers;
  } else {
    const stats = await prisma.siteStats.findUnique({ where: { id: 'site-stats' } });
    totalPlayers = stats?.totalPlayers || 0;
  }

  const todayPlayers = await prisma.dailyPlayerVisit.count({ where: { date: today } });

  return NextResponse.json({ totalPlayers, todayPlayers, isNew: previousVisits === 1 });
}
