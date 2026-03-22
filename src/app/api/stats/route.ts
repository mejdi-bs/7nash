import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/stats - Get site visits
export async function GET() {
  let stats = await prisma.siteStats.findUnique({ where: { id: 'site-stats' } });
  if (!stats) {
    stats = await prisma.siteStats.create({ data: { id: 'site-stats', visits: 0 } });
  }
  return NextResponse.json({ visits: stats.visits });
}

// POST /api/stats - Increment visits
export async function POST() {
  const stats = await prisma.siteStats.upsert({
    where: { id: 'site-stats' },
    update: { visits: { increment: 1 } },
    create: { id: 'site-stats', visits: 1 }
  });
  return NextResponse.json({ visits: stats.visits });
}
