import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { TaskModel } from '@/models/TaskModel';
import { CategoryModel } from '@/models/CategoryModel';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AnalyticsData {
  weekStart: string;
  totalMinutes: number;
  daily: Array<{
    date: string;
    spentMin: number;
    taskMinutes: number;
    eventMinutes: number;
    productiveMinutes: number;
    byCategory?: Array<{ categoryId: string; name: string; minutes: number }>;
  }>;
  byCategory: Array<{ categoryId: string; name: string; minutes: number }>;
  focusRatio: { activeMin: number; restMin: number };
  streak: number;
  averageProductiveHours: number;
  totalRestMinutes: number;
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

    // Get date from query params (defaults to today)
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    // Calculate week boundaries (Sunday to Saturday)
    const startOfWeek = new Date(targetDate);
    const dayOfWeek = startOfWeek.getDay(); // 0 = Sunday, 6 = Saturday
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    console.log('Fetching weekly analytics for user:', user.userId);
    console.log('Week range:', startOfWeek, 'to', endOfWeek);

    // Get all tasks for the week
    const tasks = await TaskModel.find({
      userId: user.userId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).populate('categoryId');

    console.log('Found', tasks.length, 'tasks for the week');

    // Get all categories for the user
    const categories = await CategoryModel.find({ userId: user.userId });

    // Calculate total minutes
    let totalMinutes = 0;
    const categoryMinutes: Record<string, number> = {};
    const dailyData: Record<string, {
      date: string;
      spentMin: number;
      taskMinutes: number;
      eventMinutes: number;
      productiveMinutes: number;
    }> = {};

    // Initialize daily data for the week
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dateStr = currentDay.toISOString().split('T')[0];
      
      dailyData[dateStr] = {
        date: dateStr,
        spentMin: 0,
        taskMinutes: 0,
        eventMinutes: 0,
        productiveMinutes: 0
      };
    }

    // Process tasks
    tasks.forEach(task => {
      if (task.start && task.end) {
        const start = new Date(task.start);
        const end = new Date(task.end);
        const minutes = (end.getTime() - start.getTime()) / (1000 * 60);
        
        if (minutes > 0) {
          totalMinutes += minutes;
          
          // Add to category totals
          const categoryId = task.categoryId?._id || task.categoryId;
          if (categoryId) {
            categoryMinutes[categoryId] = (categoryMinutes[categoryId] || 0) + minutes;
          }
          
          // Add to daily data
          const taskDate = new Date(task.date).toISOString().split('T')[0];
          if (dailyData[taskDate]) {
            dailyData[taskDate].taskMinutes += minutes;
            dailyData[taskDate].spentMin += minutes;
            dailyData[taskDate].productiveMinutes += minutes;
          }
        }
      }
    });

    // Build byCategory array
    const byCategory = Object.entries(categoryMinutes).map(([categoryId, minutes]) => {
      const category = categories.find(cat => cat._id.toString() === categoryId);
      return {
        categoryId,
        name: category?.name || 'Unknown',
        minutes: Math.round(minutes)
      };
    });

    // Build daily array
    const daily = Object.values(dailyData).map(day => ({
      ...day,
      spentMin: Math.round(day.spentMin),
      taskMinutes: Math.round(day.taskMinutes),
      eventMinutes: Math.round(day.eventMinutes),
      productiveMinutes: Math.round(day.productiveMinutes)
    }));

    // Calculate streak - consecutive days with productive minutes >= threshold
    let streak = 0;
    let currentStreak = 0;
    const streakThreshold = 60; // Minimum productive minutes to count for streak

    for (const dayData of daily) {
      if (dayData.productiveMinutes >= streakThreshold) {
        currentStreak++;
      } else {
        streak = Math.max(streak, currentStreak);
        currentStreak = 0;
      }
    }
    streak = Math.max(streak, currentStreak);

    console.log('Streak calculation:');
    console.log('Daily productive minutes:', daily.map(d => ({ date: d.date, minutes: d.productiveMinutes })));
    console.log('Final streak:', streak);

    const weeklyAnalytics: AnalyticsData = {
      weekStart: startOfWeek.toISOString().split('T')[0],
      totalMinutes: Math.round(totalMinutes),
      daily,
      byCategory,
      focusRatio: { 
        activeMin: Math.round(totalMinutes * 0.8), // Assume 80% active time
        restMin: Math.round(totalMinutes * 0.2)    // Assume 20% rest time
      },
      streak: streak,
      averageProductiveHours: Math.round((totalMinutes / 60 / 7) * 100) / 100,
      totalRestMinutes: Math.round(totalMinutes * 0.2)
    };

    console.log('Weekly analytics result:', weeklyAnalytics);

    return corsResponse(weeklyAnalytics, 200);
  } catch (error) {
    console.error('Error fetching weekly analytics:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}
