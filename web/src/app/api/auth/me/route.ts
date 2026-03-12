import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || '';

  if (!token) {
    return NextResponse.json(
      { detail: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userData = await backendResponse.json();
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json(
      { detail: 'Cannot reach backend' },
      { status: 503 }
    );
  }
}
