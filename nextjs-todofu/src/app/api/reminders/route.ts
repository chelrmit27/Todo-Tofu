import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ReminderModel } from '@/models/ReminderModel';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ error: 'User is not authenticated' }, 401);
    }
    await connectToDatabase();
    const reminders = await ReminderModel.find({ userId: user.userId });
    return corsResponse(reminders, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return corsResponse({ error: `Failed to fetch reminder: ${errorMessage}` }, 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ error: 'User is not authenticated' }, 401);
    }
    await connectToDatabase();
    const body = await request.json();
    const { title, description, date, time } = body;
    if (!title || !date || !time) {
      return corsResponse({ error: 'Title, date, and time are required' }, 400);
    }
    const dueDateTime = `${date}T${time}:00`;
    const parsedDueDate = new Date(dueDateTime);
    if (isNaN(parsedDueDate.getTime())) {
      return corsResponse({ error: 'Invalid date or time format' }, 400);
    }
    const newReminder = new ReminderModel({
      title,
      description,
      dueAt: parsedDueDate,
      userId: user.userId,
    });
    await newReminder.save();
    return corsResponse(newReminder, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return corsResponse({ error: `Error creating new reminder: ${errorMessage}` }, 400);
  }
}
