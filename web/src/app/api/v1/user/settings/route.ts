import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';

export async function GET(request: Request) {
  const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/user/settings`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to get settings' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { detail: 'Cannot reach backend' },
      { status: 503 }
    );
  }
}

export async function PATCH(request: Request) {
  const BACKEND_URL = process.env.BACKEND_BASE_URL?.replace(/\/$/, "") + "/api/v1" || 'http://localhost:8000/api/v1';
  
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/user/settings`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to update settings' },
        { status: backendResponse.status }
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { detail: 'Cannot reach backend' },
      { status: 503 }
    );
  }
}
