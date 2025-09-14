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

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Find event and verify ownership
    const existingEvent = await EventModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId)
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update event
    const updatedEvent = await EventModel.findByIdAndUpdate(
      id,
      {
        ...body,
        start: body.start ? new Date(body.start) : existingEvent.start,
        end: body.end ? new Date(body.end) : existingEvent.end,
      },
      { new: true }
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Event PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid event ID' }, { status: 400 });
    }

    // Find and delete event (verify ownership)
    const deletedEvent = await EventModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId)
    });

    if (!deletedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Event DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);
