import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    try {
      console.log('Login request:', { email, password });
      const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000),
      });

      const userData = await backendResponse.json();
      console.log('Login response:', backendResponse.status, userData);

      if (!backendResponse.ok) {
        let errorMessage = 'Invalid credentials';
        if (userData.detail) {
          if (typeof userData.detail === 'string') {
            errorMessage = userData.detail;
          } else if (Array.isArray(userData.detail)) {
            const firstError = userData.detail[0];
            if (firstError && typeof firstError === 'object') {
              errorMessage = firstError.msg || firstError.message || JSON.stringify(firstError);
            }
          } else if (typeof userData.detail === 'object') {
            errorMessage = userData.detail.msg || userData.detail.message || JSON.stringify(userData.detail);
          }
        } else if (userData.message) {
          errorMessage = userData.message;
        }
        return NextResponse.json(
          { success: false, message: errorMessage },
          { status: backendResponse.status }
        );
      }

      const { access_token, token_type, user } = userData;
      return NextResponse.json({ success: true, token: access_token, user: user || {} });
    } catch (dbError) {
      console.error('Backend connection failed:', dbError);
      return NextResponse.json(
        { success: false, message: 'Cannot reach backend service.' },
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
