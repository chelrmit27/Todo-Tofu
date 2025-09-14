import { NextRequest } from 'next/server';
import { corsResponse } from '@/lib/cors';
import { getAuthUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { TaskModel } from '@/models/TaskModel';
import { EventModel } from '@/models/EventModel';
import { UserModel } from '@/models/UserModel';

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

// Define type for tasks
interface TaskDoc {
  categoryId?: { _id?: string; name?: string } | string;
  durationMin?: number;
}

// Define type for daily analytics
interface DailyAnalytics {
  date: string;
  spentMin: number;
  taskMinutes: number;
  eventMinutes: number;
  productiveMinutes: number;
  byCategory: Array<{ categoryId: string; name: string; minutes: number }>;
}

// Define type for weekly analytics
interface WeeklyAnalytics {
  weekStart: string;
  totalMinutes: number;
  daily: DailyAnalytics[];
  byCategory: Array<{ categoryId: string; name: string; minutes: number }>;
  focusRatio: { activeMin: number; restMin: number };
  streak: number;
  averageProductiveHours: number;
  totalRestMinutes: number;
}

// Utility: Get start/end UTC for a given date string
function dayBoundsUTC(dateStr: string) {
  const date = new Date(dateStr);
  const startUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
  const endUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
  return { startUTC, endUTC };
}

// Utility: Clamp event to day boundaries
function clampToDay(start: Date, end: Date, dayStart: Date, dayEnd: Date) {
  const s = start < dayStart ? dayStart : start;
  const e = end > dayEnd ? dayEnd : end;
  return s < e ? { start: s, end: e } : null;
}

// Utility: Minutes between two dates
function minutesBetween(start: Date, end: Date) {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

// GET /api/aggregation/analytics/weekly?type=day&date=YYYY-MM-DD
export async function getDaySummary(userId: string, date: string) {
  const { startUTC, endUTC } = dayBoundsUTC(date);
  const tasks = await TaskModel.find({ userId, date: { $gte: startUTC, $lt: endUTC } });
  const events = await EventModel.find({ userId, start: { $lt: endUTC }, end: { $gt: startUTC } });

  const taskMinutes = tasks.reduce((sum, t) => sum + (t.durationMin || 0), 0);
  const eventMinutes = events.reduce((sum, ev) => {
    const c = clampToDay(ev.start, ev.end, startUTC, endUTC);
    return sum + (c ? minutesBetween(c.start, c.end) : 0);
  }, 0);

  // Get user preferences (default 720 min)
  const user = await UserModel.findById(userId);
  const budgetMin = user?.preferences?.dailyBudgetMin || 720;
  const spentMin = taskMinutes + eventMinutes;
  const remainingMin = budgetMin - spentMin;

  const doneTasks = tasks.filter((task) => task.done);
  const totalTasks = tasks.length;
  const taskProgress = {
    simple: totalTasks > 0 ? doneTasks.length / totalTasks : 0,
    timeWeighted: totalTasks > 0 ? doneTasks.reduce((sum, task) => sum + (task.durationMin || 0), 0) / (taskMinutes || 1) : 0,
  };

  const breakdownByCategory = tasks.reduce((acc: { categoryId: string; name: string; minutes: number }[], task) => {
    const categoryId = task.categoryId?.toString() || 'uncategorized';
    const categoryName = task.categoryName || 'Uncategorized';
    const category = acc.find((c) => c.categoryId === categoryId);
    if (category) {
      category.minutes += task.durationMin || 0;
    } else {
      acc.push({ categoryId, name: categoryName, minutes: task.durationMin || 0 });
    }
    return acc;
  }, []);

  return {
    budgetMin,
    spentMin,
    remainingMin,
    taskProgress,
    breakdownByCategory,
  };
}

// GET /api/aggregation/analytics/weekly?type=trends&start=YYYY-MM-DD
export async function getWeeklyTrends(userId: string, start: string) {
  const startDate = new Date(start);
  const dayOfWeek = startDate.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  startDate.setDate(startDate.getDate() - diffToMonday);

  const daily: { date: string; minutes: number }[] = [];
  const byCategory: { categoryId: string; name: string; minutes: number }[] = [];
  let streak = 0;
  let currentStreak = 0;
  let totalSpentMinutes = 0;
  let daysWithData = 0;
  const threshold = 60;

  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startDate);
    dayStart.setDate(startDate.getDate() + i);
    const dayStartString = dayStart.toISOString().split('T')[0];
    const { startUTC, endUTC } = dayBoundsUTC(dayStartString);
    const tasks = await TaskModel.find({ userId, date: { $gte: startUTC, $lt: endUTC } });
    const events = await EventModel.find({ userId, start: { $lt: endUTC }, end: { $gt: startUTC } });
    const taskMinutes = tasks.reduce((sum, t) => sum + (t.durationMin || 0), 0);
    const eventMinutes = events.reduce((sum, ev) => {
      const c = clampToDay(ev.start, ev.end, startUTC, endUTC);
      return sum + (c ? minutesBetween(c.start, c.end) : 0);
    }, 0);
    const totalMinutes = taskMinutes + eventMinutes;
    totalSpentMinutes += totalMinutes;
    daily.push({ date: dayStartString, minutes: totalMinutes });
    if (totalMinutes > 0) daysWithData++;
    tasks.forEach((task) => {
      const categoryId = task.categoryId?.toString() || 'uncategorized';
      const categoryName = task.categoryName || 'Uncategorized';
      const category = byCategory.find((c) => c.categoryId === categoryId);
      if (category) {
        category.minutes += task.durationMin || 0;
      } else {
        byCategory.push({ categoryId, name: categoryName, minutes: task.durationMin || 0 });
      }
    });
    const productiveMinutes = totalMinutes;
    if (productiveMinutes >= threshold) {
      currentStreak++;
    } else {
      streak = Math.max(streak, currentStreak);
      currentStreak = 0;
    }
  }
  streak = Math.max(streak, currentStreak);
  const focusRatio = daysWithData > 0 ? totalSpentMinutes / daysWithData / 60 : 0;
  const averageByCategory = byCategory.map((category) => ({
    categoryId: category.categoryId,
    name: category.name,
    minutes: category.minutes / 7,
  }));
  return { byCategory: averageByCategory, daily, focusRatio, streak };
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

    // Calculate week boundaries (Monday to Sunday) in UTC+7
    const utcNow = new Date();
    // Add 7 hours for UTC+7
    const utc7Now = new Date(utcNow.getTime() + 7 * 60 * 60 * 1000);
    // Get the local date part in UTC+7
    const year = utc7Now.getFullYear();
    const month = utc7Now.getMonth();
    const date = utc7Now.getDate();
    const localMonday = new Date(year, month, date);
    const dayOfWeek = localMonday.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diffToMonday = (dayOfWeek + 6) % 7;
    localMonday.setDate(localMonday.getDate() - diffToMonday);
    localMonday.setHours(0, 0, 0, 0);

    const startOfWeek = localMonday;
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    console.log('Fetching weekly analytics for user:', user.userId);
    console.log('Week range:', startOfWeek, 'to', endOfWeek);
    console.log('MONGODB_URI:', process.env.MONGODB_URI);

    // Get all tasks for the week
    const rawTasks = await TaskModel.find({
      userId: user.userId,
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    }).populate('categoryId');

    // Map to plain JS objects with correct categoryId shape
    const tasks: TaskDoc[] = rawTasks.map((task: any) => {
      let categoryId: any = 'uncategorized';
      let categoryName: any = 'Uncategorized';
      if (task.categoryId && typeof task.categoryId === 'object') {
        categoryId = task.categoryId._id?.toString() || 'uncategorized';
        categoryName = task.categoryId.name || 'Uncategorized';
      } else if (typeof task.categoryId === 'string') {
        categoryId = task.categoryId;
      }
      return {
        ...task.toObject(),
        categoryId: { _id: categoryId, name: categoryName },
        durationMin: task.durationMin || 0
      };
    });

    console.log('Found', tasks.length, 'tasks for the week');

    // Initialize daily data for the week
    const daily: Array<{
      date: string;
      spentMin: number;
      taskMinutes: number;
      eventMinutes: number;
      productiveMinutes: number;
      byCategory?: Array<{ categoryId: string; name: string; minutes: number }>;
    }> = [];
    const byCategory: { categoryId: string; name: string; minutes: number }[] = [];
    let totalMinutes = 0;
    let streak = 0;
    let currentStreak = 0;
    const streakThreshold = 60;

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dateStr = currentDay.toISOString().split('T')[0];
      // Use local time bounds for the day
      const startLocal = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 0, 0, 0, 0);
      const endLocal = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), 23, 59, 59, 999);

      // Fetch tasks for the day
      const rawDayTasks = await TaskModel.find({
        userId: user.userId,
        date: { $gte: startLocal, $lt: endLocal }
      }).populate('categoryId');
      const tasks: TaskDoc[] = rawDayTasks.map((task: any) => {
        let categoryId: any = 'uncategorized';
        let categoryName: any = 'Uncategorized';
        if (task.categoryId && typeof task.categoryId === 'object') {
          categoryId = task.categoryId._id?.toString() || 'uncategorized';
          categoryName = task.categoryId.name || 'Uncategorized';
        } else if (typeof task.categoryId === 'string') {
          categoryId = task.categoryId;
        }
        return {
          ...task.toObject(),
          categoryId: { _id: categoryId, name: categoryName },
          durationMin: task.durationMin || 0
        };
      });
      // No events used, so eventMinutes is 0
      const eventMinutes = 0;

      // Calculate minutes
      const taskMinutes = tasks.reduce((sum, t) => sum + (t.durationMin || 0), 0);
      const spentMin = taskMinutes + eventMinutes;
      totalMinutes += spentMin;
      const productiveMinutes = spentMin;

      // Calculate streak
      if (productiveMinutes >= streakThreshold) {
        currentStreak++;
      } else {
        streak = Math.max(streak, currentStreak);
        currentStreak = 0;
      }

      // Aggregate by category for the day
      const breakdownByCategory = tasks.reduce(
        (acc: { categoryId: string; name: string; minutes: number }[], task) => {
          let categoryId = 'uncategorized';
          let categoryName = 'Uncategorized';
          if (typeof task.categoryId === 'object' && task.categoryId !== null) {
            categoryId = task.categoryId._id || 'uncategorized';
            categoryName = task.categoryId.name || 'Uncategorized';
          } else if (typeof task.categoryId === 'string') {
            categoryId = task.categoryId;
          }
          const minutes = task.durationMin || 0;
          const existing = acc.find(c => c.categoryId === categoryId);
          if (existing) {
            existing.minutes += minutes;
          } else {
            acc.push({ categoryId, name: categoryName, minutes });
          }
          return acc;
        },
        []
      );

      // Add to weekly byCategory
      breakdownByCategory.forEach(cat => {
        const existing = byCategory.find(c => c.categoryId === cat.categoryId);
        if (existing) {
          existing.minutes += cat.minutes;
        } else {
          byCategory.push({ ...cat });
        }
      });

      daily.push({
        date: dateStr,
        spentMin,
        taskMinutes,
        eventMinutes,
        productiveMinutes,
        byCategory: breakdownByCategory
      });
    }
    streak = Math.max(streak, currentStreak);

    const weeklyAnalytics: AnalyticsData = {
      weekStart: startOfWeek.toISOString().split('T')[0],
      totalMinutes: Math.round(totalMinutes),
      daily,
      byCategory: byCategory.map(cat => ({ ...cat, minutes: Math.round(cat.minutes) })),
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
    console.error('Error in analytics weekly route:', error);
    return corsResponse({ message: 'Internal server error' }, 500);
  }
}
