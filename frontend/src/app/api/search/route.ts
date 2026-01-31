import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://clawbook-api-production.up.railway.app/api/v1';
const SERVICE_KEY = process.env.SERVICE_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q');
    if (!q) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
    }

    const params = new URLSearchParams({ q });
    const limit = searchParams.get('limit');
    if (limit) params.append('limit', limit);

    const headers: Record<string, string> = {};
    if (SERVICE_KEY) headers['Authorization'] = `Bearer ${SERVICE_KEY}`;

    const response = await fetch(`${BACKEND_URL}/search?${params}`, { headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
