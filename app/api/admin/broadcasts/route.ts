import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { requireAdminAccess } from '@/lib/adminAuth';
import { secureJson, sanitizeString, checkAdminRateLimit } from '@/lib/apiSecurity';

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Rate limit admin actions
    const rl = checkAdminRateLimit(adminCheck.userId ?? 'unknown', request);
    if (rl) return rl;

    const body = await request.json();

    const subject = sanitizeString(body.subject, 200);
    const content = sanitizeString(body.content, 10000);

    if (!subject) {
      return secureJson({ error: 'Subject is required' }, { status: 400 });
    }
    if (!content) {
      return secureJson({ error: 'Content is required' }, { status: 400 });
    }

    const db = await getDb();

    const recipientCount = await db.collection('subscribers').countDocuments({ status: { $in: ['Active', 'active'] } });

    const broadcast = {
      subject,
      content,
      sentAt: new Date(),
      recipientCount,
      sentBy: adminCheck.userId,
    };

    const result = await db.collection('broadcasts').insertOne(broadcast);

    return secureJson({ id: result.insertedId.toString(), ...broadcast });
  } catch (error) {
    console.error('Error creating broadcast:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'Failed to create broadcast' }, { status: 500 });
  }
}
