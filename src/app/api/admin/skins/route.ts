import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Simple admin secret check (in production, use proper auth)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123';

// POST /api/admin/skins - Grant or revoke private skin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, username, skinId, action } = body;

    // Verify admin secret
    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!username || !skinId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentSkins = user.privateSkins ? user.privateSkins.split(',').filter(Boolean) : [];
    let newSkins: string[];

    if (action === 'grant') {
      if (currentSkins.includes(skinId)) {
        return NextResponse.json({ message: 'User already has this skin' });
      }
      newSkins = [...currentSkins, skinId];
    } else if (action === 'revoke') {
      newSkins = currentSkins.filter(s => s !== skinId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await prisma.user.update({
      where: { username: username.toLowerCase() },
      data: { privateSkins: newSkins.join(',') }
    });

    return NextResponse.json({
      success: true,
      username,
      skinId,
      action,
      privateSkins: newSkins
    });
  } catch (error) {
    console.error('Admin skins error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/admin/skins - List users with their private skins
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { username: true, privateSkins: true, highScore: true },
      orderBy: { highScore: 'desc' },
      take: 50
    });

    return NextResponse.json(users.map(u => ({
      username: u.username,
      highScore: u.highScore,
      privateSkins: u.privateSkins ? u.privateSkins.split(',').filter(Boolean) : []
    })));
  } catch (error) {
    console.error('Admin skins list error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
