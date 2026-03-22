import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/stats - Get site stats
export async function GET() {
  const stats = await prisma.siteStats.findUnique({ where: { id: 'site-stats' } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daily = await prisma.dailyVisit.findUnique({ where: { date: today } });

  return NextResponse.json({
    totalVisits: stats?.totalVisits || 0,
    todayVisits: daily?.count || 0
  });
}

// POST /api/stats - Record visit
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { username } = body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update total visits
  const stats = await prisma.siteStats.upsert({
    where: { id: 'site-stats' },
    update: { totalVisits: { increment: 1 } },
    create: { id: 'site-stats', totalVisits: 1 }
  });

  // Update daily visits
  await prisma.dailyVisit.upsert({
    where: { date: today },
    update: { count: { increment: 1 } },
    create: { date: today, count: 1 }
  });

  return NextResponse.json({ visits: stats.totalVisits });
}
