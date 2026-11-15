import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createTransformation } from '@/lib/db';
import { executeTransformation } from '@/lib/ai-service';

/**
 * POST /api/transform
 * 
 * Transforms raw text based on the chosen transformation type,
 * automatically saves the generated result to the database,
 * and returns the completed transformation.
 * 
 * =========================================================================
 * WHERE TO PASTE YOUR API KEYS:
 * =========================================================================
 * 1. For OpenAI: Open your .env.local file and set:
 *      AI_PROVIDER="openai"
 *      OPENAI_API_KEY="sk-..."
 * 
 * 2. For Google Gemini: Open your .env.local file and set:
 *      AI_PROVIDER="gemini"
 *      GEMINI_API_KEY="..."
 * 
 * By default, if no key is provided, the platform uses its high-quality
 * mock AI transformation engine so everything works right out of the box!
 * =========================================================================
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, type, targetLanguage, tone, length } = body;

    // Validate request inputs
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Raw text content is required for transformation.' },
        { status: 400 }
      );
    }

    if (!type || typeof type !== 'string' || type.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'A valid transformation type must be selected.' },
        { status: 400 }
      );
    }

    // Call the AI transformation service
    const aiResult = await executeTransformation({
      text: text.trim(),
      type: type.trim(),
      targetLanguage,
      tone,
      length,
    });

    // Generate unique identifier and timestamp
    const id = `tx_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const now = new Date().toISOString();

    // Automatically persist the transformation to the database
    const savedRecord = createTransformation({
      id,
      original_text: text.trim(),
      transformed_text: aiResult.transformedText,
      transformation_type: type.trim(),
      created_at: now,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...savedRecord,
          meta: {
            provider: aiResult.provider,
            model: aiResult.modelUsed,
            processingTimeMs: aiResult.processingTimeMs,
            wordCount: aiResult.wordCount,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /api/transform Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred during content transformation.',
      },
      { status: 500 }
    );
  }
}
