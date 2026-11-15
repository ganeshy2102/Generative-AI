import { NextRequest, NextResponse } from 'next/server';
import { getTransformationById, deleteTransformation } from '@/lib/db';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/history/[id]
 * Fetch a specific transformation record by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const record = getTransformationById(id);

    if (!record) {
      return NextResponse.json(
        { success: false, error: `Transformation record not found with id: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: record,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[API GET /api/history/${params.id} Error]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve record.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history/[id]
 * Delete a specific transformation record by ID
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const deleted = deleteTransformation(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Transformation record with id "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Transformation record "${id}" successfully deleted.`,
        id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`[API DELETE /api/history/${params.id} Error]:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete record.' },
      { status: 500 }
    );
  }
}
