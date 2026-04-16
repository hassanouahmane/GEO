import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const categories = new Set(['restaurant', 'hotel', 'site', 'leisure']);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updatedPoi = await prisma.pOI.update({
      where: { id },
      data: {
        name: name.trim(),
        category,
        latitude,
        longitude,
        description: typeof description === 'string' && description.trim() ? description.trim() : null,
      },
    });

    return NextResponse.json(updatedPoi);
  } catch (error) {
    console.error('[PUT /api/pois/:id] Failed to update POI:', error);
    return NextResponse.json({ error: 'Failed to update POI' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.pOI.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/pois/:id] Failed to delete POI:', error);
    return NextResponse.json({ error: 'Failed to delete POI' }, { status: 500 });
  }
}
