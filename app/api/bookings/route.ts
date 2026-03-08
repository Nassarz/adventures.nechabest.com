import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Create a new booking
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const body = await request.json();

    const {
      tourId,
      tourTitle,
      fullName,
      email,
      phone,
      numberOfPeople,
      bookingDate,
      specialRequests,
    } = body;

    // Validation
    if (!fullName || !email || !numberOfPeople || !bookingDate) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, numberOfPeople, bookingDate' },
        { status: 400 }
      );
    }

    const booking = {
      tourId,
      tourTitle,
      fullName,
      email,
      phone,
      numberOfPeople: parseInt(numberOfPeople),
      bookingDate: new Date(bookingDate),
      specialRequests: specialRequests || '',
      status: 'pending',
      createdAt: new Date(),
      read: false, // For admin notification tracking
    };

    const result = await db.collection('bookings').insertOne(booking);

    return NextResponse.json({
      success: true,
      id: result.insertedId.toString(),
      message: 'Booking submitted successfully! We will contact you shortly.',
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
