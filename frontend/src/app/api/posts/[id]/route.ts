import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://extraction-docs-intelligent-symbols.trycloudflare.com/api/v1';
const SERVICE_KEY = process.env.SERVICE_API_KEY;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const headers: Record<string, string> = {};
    if (SERVICE_KEY) headers['Authorization'] = `Bearer ${SERVICE_KEY}`;

    const response = await fetch(`${BACKEND_URL}/posts/${params.id}`, { headers });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
