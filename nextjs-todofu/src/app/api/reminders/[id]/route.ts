import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ReminderModel } from '@/models/ReminderModel';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ error: 'User is not authenticated' }, 401);
    }
    await connectToDatabase();
    const body = await request.json();
    const reminder = await ReminderModel.findOne({ _id: id, userId: user.userId });
    if (!reminder) {
      return corsResponse({ error: 'Reminder not found' }, 404);
    }
    if (body.title) reminder.title = body.title;
    if (body.description) reminder.description = body.description;
    if (body.dueDate) reminder.dueAt = new Date(body.dueDate);
    await reminder.save();
    return corsResponse(reminder, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return corsResponse({ error: `Error updating reminder: ${errorMessage}` }, 400);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ error: 'User is not authenticated' }, 401);
    }
    await connectToDatabase();
    const reminder = await ReminderModel.findOneAndDelete({ _id: id, userId: user.userId });
    if (!reminder) {
      return corsResponse({ error: 'Reminder not found' }, 404);
    }
    return corsResponse({ message: 'Reminder deleted successfully' }, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return corsResponse({ error: `Error deleting reminder: ${errorMessage}` }, 400);
  }
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}
