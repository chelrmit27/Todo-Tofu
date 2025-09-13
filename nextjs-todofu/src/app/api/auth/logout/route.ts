import { NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

export async function POST() {
  try {
    console.log('🔐 Logout endpoint hit');
    
    const response = NextResponse.json({
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });

    // Add CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    console.log('✅ Logout response prepared');
    return response;
  } catch (error) {
    console.error('🚨 Logout Error:', error);
    const errorResponse = NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    
    // Add CORS headers to error response too
    Object.entries(corsHeaders).forEach(([key, value]) => {
      errorResponse.headers.set(key, value);
    });
    
    return errorResponse;
  }
}
