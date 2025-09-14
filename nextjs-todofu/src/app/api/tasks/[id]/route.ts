import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { TaskModel } from '@/models/TaskModel';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    // Connect to database
    await connectToDatabase();

    const body = await request.json();
    const { id: taskId } = await params;

    // Update the task
    const updatedTask = await TaskModel.findOneAndUpdate(
      { _id: taskId, userId: user.userId },
      body,
      { new: true }
    ).populate('categoryId');

    if (!updatedTask) {
      return corsResponse({ message: 'Task not found or unauthorized' }, 404);
    }

    return corsResponse(updatedTask, 200);
  } catch (error) {
    console.error('Error in tasks [id] route:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    // Connect to database
    await connectToDatabase();

    const { id: taskId } = await params;

    // Delete the task
    const deletedTask = await TaskModel.findOneAndDelete({
      _id: taskId,
      userId: user.userId,
    });

    if (!deletedTask) {
      return corsResponse({ message: 'Task not found or unauthorized' }, 404);
    }

    return corsResponse({ message: 'Task deleted successfully' }, 200);
  } catch (error) {
    console.error('Error in tasks [id] route:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}

console.log('MONGODB_URI:', process.env.MONGODB_URI);
