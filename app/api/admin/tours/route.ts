import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';

export async function GET() {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const db = await getDb();
    const tours = await db.collection('tours').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(
      tours.map((tour) => {
        const { _id, ...rest } = tour;
        return { ...rest, id: _id.toString() };
      })
    );
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json({ error: 'Failed to fetch tours' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const db = await getDb();

    const tour = {
      ...body,
      showOnHome: Boolean(body.showOnHome),
      published: body.published ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: adminCheck.userId,
    };

    const result = await db.collection('tours').insertOne(tour);

    return NextResponse.json({ id: result.insertedId.toString(), ...tour });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json({ error: 'Failed to create tour' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid tour ID format' }, { status: 400 });
    }

    const db = await getDb();
    // Never allow immutable/managed fields to be overwritten from client input.
    // This prevents Mongo update errors like modifying _id.
    const { _id, createdAt, createdBy, updatedAt, updatedBy, ...safeUpdateData } = updateData as Record<string, unknown>;

    const normalizedData = {
      ...safeUpdateData,
      ...(Object.prototype.hasOwnProperty.call(safeUpdateData, 'showOnHome')
        ? { showOnHome: Boolean(safeUpdateData.showOnHome) }
        : {}),
    };

    const result = await db.collection('tours').updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...normalizedData, updatedAt: new Date(), updatedBy: adminCheck.userId } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Tour updated successfully' });
  } catch (error) {
    console.error('Error updating tour:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: `Failed to update tour: ${errorMessage}`, 
      details: errorMessage 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('tours').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
  }
}
