import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { corsResponse, handlePreflight } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { TaskModel } from '@/models/TaskModel';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return handlePreflight();
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    console.log('Fetching tasks for user:', user.userId);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const query: { userId: string; date?: { $gte: Date; $lte: Date } } = { userId: user.userId };

    // Filter by date if provided
    if (dateParam) {
      const targetDate = new Date(dateParam);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    // Fetch tasks
    const tasks = await TaskModel.find(query).populate('categoryId');

    console.log('Found', tasks.length, 'tasks');
    
    return corsResponse({
      message: 'Tasks fetched successfully',
      tasks: tasks,
      totalTasks: tasks.length,
      userId: user.userId
    });
    
  } catch (error) {
    console.error('Tasks fetch error:', error);
    
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return corsResponse({ message: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    console.log('Creating task for user:', user.userId, 'with data:', body);

    // Create new task
    const newTask = new TaskModel({
      ...body,
      userId: user.userId,
    });

    const savedTask = await newTask.save();
    console.log('Task created:', savedTask);

    return corsResponse(savedTask, 201);
    
  } catch (error) {
    console.error('Task creation error:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}
