import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';

export async function GET(request: Request) {
  console.log("=== /api/auth/me route hit ===");
  const authHeader = request.headers.get('authorization');
  console.log('NEXT.JS /api/auth/me - authorization header:', authHeader);
  const token = authHeader?.replace('Bearer ', '') || '';

  if (!token) {
    console.log('NEXT.JS /api/auth/me - NO TOKEN FOUND');
    return NextResponse.json(
      { detail: 'Not authenticated - no token' },
      { status: 401 }
    );
  }
  
  console.log('NEXT.JS /api/auth/me - forwarding to backend with token:', token.substring(0, 20) + '...');

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
