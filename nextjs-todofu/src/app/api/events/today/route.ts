import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { EventModel } from '@/models/EventModel';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    // Connect to database
    await connectToDatabase();

    // Get today's date boundaries
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's events for the user
    const events = await EventModel.find({
      userId: user.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return corsResponse({
      events,
      totalEvents: events.length
    }, 200);
  } catch (error) {
    console.error('Error fetching today\'s events:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}
