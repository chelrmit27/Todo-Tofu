import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { EventModel } from '@/models/EventModel';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

interface EventQuery {
  userId: Types.ObjectId;
  start?: {
    $gte: Date;
    $lte: Date;
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = decoded.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const query: EventQuery = { userId: new Types.ObjectId(userId) };

    // Add date filtering if provided
    if (from && to) {
      query.start = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const events = await EventModel.find(query).sort({ start: 1 });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Events GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get auth token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const userId = decoded.userId;

    const body = await request.json();
    const { title, start, end, allDay, location, notes } = body;

    // Validate required fields
    if (!title || !start || !end) {
      return NextResponse.json(
        { error: 'Title, start, and end are required' },
        { status: 400 }
      );
    }

    // Create new event
    const event = new EventModel({
      title,
      start: new Date(start),
      end: new Date(end),
      allDay: allDay || false,
      location,
      notes,
      userId: new Types.ObjectId(userId),
      source: 'manual'
    });

    const savedEvent = await event.save();

    return NextResponse.json(savedEvent, { status: 201 });
  } catch (error) {
    console.error('Events POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);
