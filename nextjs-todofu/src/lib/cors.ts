import { NextResponse } from 'next/server';

// CORS headers for API routes
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.vercel.app' // Update this when you deploy
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-auth-token',
  'Access-Control-Allow-Credentials': 'true',
};

export function corsResponse(data: unknown, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export function handlePreflight() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}
