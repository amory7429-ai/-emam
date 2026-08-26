// Server-side proxy for Quran.com API v4
// Centralizes API access, enables future credential-based auth
// Current: public API (no auth required)

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://api.quran.com/api/v4';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Build forwarded URL with all remaining params
  const forwardedParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') forwardedParams.set(key, value);
  });

  const url = `${BASE_URL}/${endpoint}${forwardedParams.toString() ? '?' + forwardedParams.toString() : ''}`;

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch from Quran API' },
      { status: 502 }
    );
  }
}
