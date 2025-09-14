import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { TaskModel } from '@/models/TaskModel';

interface TaskWithDuration {
  _id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  categoryId: string;
  userId: string;
  status: string;
  duration?: number;
  timeSpent?: number;
  done: boolean;
}

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

    // Get today's tasks for the user
    const rawTasks = await TaskModel.find({
      userId: user.userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('categoryId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasks: TaskWithDuration[] = rawTasks.map((task: any) => ({
      _id: task._id.toString(),
      title: task.title,
      description: task.description ?? '',
      start: task.start,
      end: task.end,
      categoryId: task.categoryId?._id?.toString() ?? '',
      userId: task.userId,
      status: task.status ?? '',
      duration: task.duration ?? 0,
      timeSpent: task.timeSpent ?? 0,
      done: !!task.done,
    }));

    console.log('Found', tasks.length, 'tasks for today');

    // Calculate spent hours from start/end times
    const spentHours = tasks.reduce((total, task: TaskWithDuration) => {
      if (task.start && task.end) {
        const start = new Date(task.start);
        const end = new Date(task.end);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        console.log(`Task "${task.title}": ${hours} hours`);
        return total + Math.max(0, hours); // Ensure no negative hours
      }
      return total;
    }, 0);

    console.log('Total spent hours calculated:', spentHours);

    const response = {
      tasks,
      spentHours: Math.round(spentHours * 100) / 100, // Round to 2 decimal places
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task: TaskWithDuration) => task.done).length
    };

    return corsResponse(response, 200);
  } catch (error) {
    console.error('Error fetching today\'s tasks:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}

export async function OPTIONS() {
  return corsResponse({}, 200);
}
