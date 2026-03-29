import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';

export async function POST(request: Request) {
  console.log("=== /api/v1/user/onboarding route hit ===");
  
  try {
    const body = await request.json();
    const token = body.token;
    console.log('Onboarding route - token from body:', token ? 'present' : 'MISSING');
    
    // Remove token from body before sending to backend
    delete body.token;
    
    if (!token) {
      console.log('Onboarding route - no token found');
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/user/onboarding`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.log('Backend error:', errorData);
      return NextResponse.json(
        { detail: errorData.detail || 'Onboarding failed' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (err) {
    console.log('Onboarding route error:', err);
    return NextResponse.json(
      { detail: 'Cannot reach backend' },
      { status: 503 }
    );
  }
}
