import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { extractStampData } from '@/lib/gemini';
import crypto from 'node:crypto';

/**
 * POST /api/upload
 * Accepts a passport stamp image (multipart form data).
 * Stores in Supabase storage, OCRs via Gemini, saves trip to database.
 *
 * Form fields:
 *   - file: image file (required)
 *   - user_id: UUID (required)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('user_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${userId}/${crypto.randomUUID()}.${ext}`;

    // Upload to Supabase storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from('passport-stamps')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('passport-stamps')
      .getPublicUrl(filename);

    const stampImageUrl = urlData.publicUrl;

    // OCR the stamp with Gemini
    const base64 = buffer.toString('base64');
    const extraction = await extractStampData(base64, file.type);

    // Save trip to database
    const { data: trip, error: insertError } = await supabase
      .from('trips')
      .insert({
        user_id: userId,
        country: extraction.country,
        city: extraction.city,
        date_visited: extraction.date,
        stamp_image_url: stampImageUrl,
        extracted_data: extraction as unknown as Record<string, unknown>,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Failed to save trip: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      trip,
      extraction,
      message: 'Stamp uploaded and processed successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
