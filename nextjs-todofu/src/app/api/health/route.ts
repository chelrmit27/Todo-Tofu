import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    await connectToDatabase();
    
    return NextResponse.json({
      status: 'healthy',
      message: 'ToDoTofu API is running',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Error in health route:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
    }, { status: 500 });
  }
}
