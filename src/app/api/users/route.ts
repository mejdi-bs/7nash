import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/db';

// GET /api/users - Get current user (by username query param)
export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    highScore: user.highScore,
    selectedSkin: user.selectedSkin,
    privateSkins: user.privateSkins ? user.privateSkins.split(',').filter(Boolean) : []
  });
}

// POST /api/users - Login or create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, selectedSkin } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const trimmedName = username.trim().toLowerCase();

    if (trimmedName.length < 1 || trimmedName.length > 20) {
      return NextResponse.json({ error: 'Username must be 1-20 characters' }, { status: 400 });
    }

    // Find existing user
    const existingUser = await prisma.user.findUnique({
      where: { username: trimmedName }
    });

    if (existingUser) {
      // Check password if user has one set
      if (existingUser.passwordHash) {
        if (!password || !compare(password, existingUser.passwordHash)) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }
      }

      // Update skin and lastActiveAt
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          selectedSkin: selectedSkin || existingUser.selectedSkin,
          lastActiveAt: new Date()
        }
      });

      return NextResponse.json({
        username: existingUser.username,
        highScore: existingUser.highScore,
        selectedSkin: selectedSkin || existingUser.selectedSkin,
        privateSkins: existingUser.privateSkins ? existingUser.privateSkins.split(',').filter(Boolean) : [],
        isNew: false
      });
    }

    // Create new user
    const passwordHash = password ? await hash(password, 10) : null;

    const newUser = await prisma.user.create({
      data: {
        username: trimmedName,
        passwordHash,
        selectedSkin: selectedSkin || 'classic',
        lastActiveAt: new Date()
      }
    });

    return NextResponse.json({
      username: newUser.username,
      highScore: newUser.highScore,
      selectedSkin: newUser.selectedSkin,
      privateSkins: [],
      isNew: true
    });
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users - Update user (high score, skin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, highScore, selectedSkin, password } = body;

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const trimmedName = username.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { username: trimmedName }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password if user has one
    if (user.passwordHash && password) {
      if (!compare(password, user.passwordHash)) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    const updateData: { highScore?: number; selectedSkin?: string; passwordHash?: string } = {};

    if (highScore !== undefined && highScore > user.highScore) {
      updateData.highScore = highScore;
    }

    if (selectedSkin !== undefined) {
      updateData.selectedSkin = selectedSkin;
    }

    if (password && !user.passwordHash) {
      updateData.passwordHash = await hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({
        username: user.username,
        highScore: user.highScore,
        selectedSkin: user.selectedSkin,
        privateSkins: user.privateSkins ? user.privateSkins.split(',').filter(Boolean) : []
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({
      username: updated.username,
      highScore: updated.highScore,
      selectedSkin: updated.selectedSkin,
      privateSkins: updated.privateSkins ? updated.privateSkins.split(',').filter(Boolean) : []
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
