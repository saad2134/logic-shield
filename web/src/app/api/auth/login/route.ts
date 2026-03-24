import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      });

      const userData = await backendResponse.json();

      if (!backendResponse.ok) {
        return NextResponse.json(
          { success: false, message: userData.detail || 'Invalid credentials' },
          { status: backendResponse.status }
        );
      }

      const { access_token, token_type, user } = userData;
      return NextResponse.json({ success: true, token: access_token, user });
    } catch (dbError) {
      console.error('Backend connection failed:', dbError);
      return NextResponse.json(
        { success: false, message: 'Cannot reach backend core service.' },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    );
  }
}
