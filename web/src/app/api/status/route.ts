import { NextResponse } from 'next/server';

interface Service {
  name: string;
  url: string;
}

function getServices(): Service[] {
  const services: Service[] = [
    { name: "Frontend: Web", url: "https://vercel.app" },
  ];

  const backendUrl = process.env.BACKEND_BASE_URL || "http://localhost:8000";
  services.push({ name: "Backend: Core Services (Auth, Database, Models etc.)", url: backendUrl });

  return services;
}

async function checkService(url: string): Promise<boolean> {
  try {
    const checkUrl = url.endsWith("/") ? url : url + "/";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(checkUrl, { method: "GET", signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET() {
  const services = getServices();
  
  if (services.length === 0) {
    return NextResponse.json({
      status: 'operational',
      services: [],
      checkedAt: new Date().toISOString(),
      message: 'No services configured'
    });
  }

  const results = await Promise.all(
    services.map(async (service) => {
      const status = await checkService(service.url);
      return {
        name: service.name,
        url: service.url,
        status,
        timestamp: new Date().toISOString(),
      };
    })
  );

  const allOperational = results.every((result) => result.status);
  const hasIssues = results.some((result) => !result.status);

  return NextResponse.json({
    status: allOperational ? 'operational' : hasIssues ? 'issues' : 'degraded',
    services: results,
    checkedAt: new Date().toISOString(),
  });
}
