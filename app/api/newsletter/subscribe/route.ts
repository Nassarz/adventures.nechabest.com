import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();

    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await db.collection('subscribers').findOne({ email });

    if (existing) {
      return NextResponse.json(
        { message: 'This email is already subscribed to our newsletter.' },
        { status: 200 }
      );
    }

    const subscriber = {
      email,
      name: name || '',
      subscribedAt: new Date(),
      status: 'active',
      source: 'website',
    };

    await db.collection('subscribers').insertOne(subscriber);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to our newsletter!',
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
