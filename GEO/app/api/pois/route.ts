import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const categories = new Set(['restaurant', 'hotel', 'site', 'leisure']);

export async function GET() {
  try {
    const pois = await prisma.pOI.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pois);
  } catch (error) {
    console.error('[GET /api/pois] Failed to fetch POIs:', error);
    return NextResponse.json({ error: 'Failed to fetch POIs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, category, latitude, longitude, description } = body as {
      name?: string;
      category?: string;
      latitude?: number;
      longitude?: number;
      description?: string;
    };

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!category || !categories.has(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const poi = await prisma.pOI.create({
      data: {
        name: name.trim(),
        category,
        latitude,
        longitude,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
      },
    });

    return NextResponse.json(poi, { status: 201 });
  } catch (error) {
    console.error('[POST /api/pois] Failed to create POI:', error);
    return NextResponse.json({ error: 'Failed to create POI' }, { status: 500 });
  }
}
