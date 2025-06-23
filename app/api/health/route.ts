import { NextRequest, NextResponse } from 'next/server';
import { errorMonitor } from '@/lib/error-monitoring';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic health check
    const healthStatus: {
      status: string;
      timestamp: string;
      version: string;
      environment: string;
      uptime: number;
      memory: NodeJS.MemoryUsage;
      checks: {
        api: string;
        database: string;
        redis: string;
        external_apis: string;
      };
      responseTime?: number;
    } = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        api: 'healthy',
        database: 'healthy', // Placeholder for future database checks
        redis: 'healthy', // Placeholder for future Redis checks
        external_apis: 'healthy'
      }
    };

    // Check external API connectivity (optional)
    try {
      // Test OpenAI API connectivity
      if (process.env.OPENAI_API_KEY) {
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!openaiResponse.ok) {
          healthStatus.checks.external_apis = 'degraded';
        }
      }
    } catch (error) {
      healthStatus.checks.external_apis = 'unhealthy';
      errorMonitor.logError('Health check: External API connectivity failed', { error });
    }

    // Check if any service is unhealthy
    const unhealthyServices = Object.entries(healthStatus.checks)
      .filter(([_, status]) => status === 'unhealthy')
      .map(([service]) => service);

    if (unhealthyServices.length > 0) {
      healthStatus.status = 'unhealthy';
      return NextResponse.json(healthStatus, { status: 503 });
    }

    // Check for degraded services
    const degradedServices = Object.entries(healthStatus.checks)
      .filter(([_, status]) => status === 'degraded')
      .map(([service]) => service);

    if (degradedServices.length > 0) {
      healthStatus.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;
    healthStatus.responseTime = responseTime;

    // Add response time header
    const response = NextResponse.json(healthStatus, { 
      status: healthStatus.status === 'healthy' ? 200 : 503 
    });
    
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    return response;

  } catch (error) {
    errorMonitor.logError('Health check failed', { error });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      checks: {
        api: 'unhealthy'
      }
    }, { status: 503 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 