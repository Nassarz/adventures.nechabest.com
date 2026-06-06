import { NextRequest } from 'next/server';
import { requireAdminAccess } from '@/lib/adminAuth';
import { secureJson } from '@/lib/apiSecurity';

// Allowed MIME types for image uploads — strict whitelist
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
// Maximum upload size: 10 MB
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin access securely using Clerk session
    const adminCheck = await requireAdminAccess();
    if (!adminCheck.ok) {
      return secureJson({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // 2. Extract uploaded image from FormData
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return secureJson({ error: 'No image file uploaded' }, { status: 400 });
    }

    // 3. Validate file MIME type (whitelist — images only)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return secureJson(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 10 MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return secureJson(
        { error: 'File is too large. Maximum allowed size is 10 MB.' },
        { status: 400 }
      );
    }

    // 5. Read the API key securely from environment variables
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      console.error('IMGBB_API_KEY is not defined in environment variables');
      return secureJson({ error: 'Image upload server is not properly configured' }, { status: 500 });
    }

    // 6. Forward the upload to ImgBB securely on the server side
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', file);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      {
        method: 'POST',
        body: imgbbFormData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ImgBB response error:', errorText);
      return secureJson({ error: 'Failed to upload image to ImgBB' }, { status: 502 });
    }

    const resData = await response.json();
    if (resData.success && resData.data?.url) {
      return secureJson({ success: true, url: resData.data.url });
    } else {
      return secureJson({ error: resData.error?.message || 'Upload failed' }, { status: 502 });
    }
  } catch (error) {
    console.error('Upload route error:', error instanceof Error ? error.message : 'unknown');
    return secureJson({ error: 'An unexpected error occurred during upload' }, { status: 500 });
  }
}
