import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const db = await getDb();

    const recipientCount = await db.collection('subscribers').countDocuments({ status: { $in: ['Active', 'active'] } });

    const broadcast = {
      subject: body.subject,
      content: body.content,
      sentAt: new Date(),
      recipientCount,
      sentBy: adminCheck.userId,
    };

    const result = await db.collection('broadcasts').insertOne(broadcast);

    return NextResponse.json({ id: result.insertedId.toString(), ...broadcast });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return NextResponse.json({ error: 'Failed to create broadcast' }, { status: 500 });
  }
}
