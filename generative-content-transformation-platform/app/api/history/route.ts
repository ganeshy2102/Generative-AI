import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getTransformations,
  createTransformation,
  deleteTransformation,
  getTransformationStats,
} from '@/lib/db';

/**
 * GET /api/history
 * Fetches all transformation records with optional filters for type, search, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const includeStats = searchParams.get('includeStats') === 'true';

    const records = getTransformations({ search, type, limit, offset });
    const stats = includeStats ? getTransformationStats() : undefined;

    return NextResponse.json(
      {
        success: true,
        count: records.length,
        data: records,
        stats,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API GET /api/history Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve transformation history.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/history
 * Manually save or bookmark a new transformation record directly.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { original_text, transformed_text, transformation_type } = body;

    if (!original_text || !transformed_text || !transformation_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fields original_text, transformed_text, and transformation_type are required.',
        },
        { status: 400 }
      );
    }

    const id = body.id || `tx_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const saved = createTransformation({
      id,
      original_text,
      transformed_text,
      transformation_type,
      created_at: body.created_at || new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data: saved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API POST /api/history Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save transformation record.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history
 * Delete a transformation by ID passed as query parameter (?id=...) or request body.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {
        // no body provided
      }
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Transformation ID is required for deletion.' },
        { status: 400 }
      );
    }

    const deleted = deleteTransformation(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Record with id "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Transformation history record deleted successfully.',
        id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API DELETE /api/history Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete transformation record.' },
      { status: 500 }
    );
  }
}
