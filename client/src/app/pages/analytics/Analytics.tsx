import React, { useState, useEffect } from 'react';
import { useCategoryContext } from '../../../context/CategoryContext';

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

const Analytics = () => {
  const { categories } = useCategoryContext();
  const [thisWeekData, setThisWeekData] = useState<AnalyticsData | null>(null);
  const [lastWeekData, setLastWeekData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        console.log('Fetching analytics data...');
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Get today's date and 7 days prior
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const todayStr = today.toISOString().split('T')[0];
        const lastWeekStr = lastWeek.toISOString().split('T')[0];

        console.log('Fetching data for this week:', todayStr);
        console.log('Fetching data for last week:', lastWeekStr);

        // Fetch this week's data
        const thisWeekResponse = await fetch(`http://localhost:5001/api/aggregation/analytics/weekly?date=${todayStr}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Fetch last week's data
        const lastWeekResponse = await fetch(`http://localhost:5001/api/aggregation/analytics/weekly?date=${lastWeekStr}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!thisWeekResponse.ok || !lastWeekResponse.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const thisWeekDataResult = await thisWeekResponse.json();
        const lastWeekDataResult = await lastWeekResponse.json();

        console.log('This week data:', thisWeekDataResult);
        console.log('Last week data:', lastWeekDataResult);

        setThisWeekData(thisWeekDataResult);
        setLastWeekData(lastWeekDataResult);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatHours = (minutes: number): string => {
    const hours = Math.round(minutes / 60 * 10) / 10;
    return `${hours}`;
  };

  const getTopCategories = () => {
    if (!thisWeekData?.byCategory.length || thisWeekData.totalMinutes === 0) {
      return [];
    }

    // Sort categories by minutes and get top 3
    const sortedCategories = [...thisWeekData.byCategory]
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3);

    return sortedCategories.map((category) => ({
      ...category,
      percentage: Math.round((category.minutes / thisWeekData.totalMinutes) * 100),
      color: categories[category.categoryId]?.color || '#2D967C', // Use category color or default
    }));
  };

  if (loading) {
    return (
      <div className="py-6 px-16 bg-[hsl(var(--page-bg))] h-screen flex flex-col items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-16 bg-[hsl(var(--page-bg))] h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  const topCategories = getTopCategories();

  return (
    <div className="py-6 px-16 bg-background h-screen flex flex-col">
      <h1 className="text-3xl font-semibold text-foreground">Time Wallet Analytics</h1>
      <div className="text-base mt-2 mb-6 text-foreground">See how you progress this week</div>

      <div className="flex flex-row justify-around">
        <div className="flex flex-col">
          <div>
            <h2 className="text-xl font-semibold mb-6 text-foreground">Category Time Share</h2>
            <div
              className="
                        bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-md
                        flex flex-row gap-4 items-center justify-center
                        h-48 w-[600px]
                    "
            >
              {topCategories.length > 0 ? (
                topCategories.map((category, index) => (
                  <div key={category.categoryId} className="px-8 py-10">
                    <div style={{ color: category.color }}>{category.name.toLowerCase()}</div>
                    <div style={{ color: category.color }} className="font-semibold text-5xl">{category.percentage}%</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="px-8 py-10">
                    <div className="text-[hsl(var(--primary-green))]">No data</div>
                    <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">0%</div>
                  </div>
                  <div className="px-8 py-10">
                    <div className="text-[hsl(var(--primary-yellow))]">No data</div>
                    <div className="text-[hsl(var(--primary-yellow))] font-semibold text-5xl">0%</div>
                  </div>
                  <div className="px-8 py-10">
                    <div className="text-[hsl(var(--primary-purple))]">No data</div>
                    <div className="text-[hsl(var(--primary-purple))] font-semibold text-5xl">0%</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold my-6 text-foreground">Average Productive Hours</h2>
            <div
              className="
                        bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-md
                        flex flex-row gap-4 items-center justify-center
                        h-48 w-[600px]
                    "
            >
              <div className="px-8 py-10">
                <div className="text-foreground">last week</div>
                <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">
                  {lastWeekData ? formatHours(lastWeekData.averageProductiveHours * 60) : '0'} hours
                </div>
              </div>

              <div className="px-8 py-10">
                <div className="text-foreground">this week</div>
                <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">
                  {thisWeekData ? formatHours(thisWeekData.averageProductiveHours * 60) : '0'} hours
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div>
            <h2 className="text-xl font-semibold mb-6 text-foreground">
              Daily Spend Comparison
            </h2>
            <div
              className="
                        bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-md
                        flex flex-row gap-4 items-center justify-center
                        h-48 w-[600px]
                    "
            >
              <div className="px-8 py-10">
                <div className="text-foreground">active time</div>
                <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">
                  {thisWeekData ? formatHours(thisWeekData.averageProductiveHours * 60) : '0'} hours
                </div>
              </div>

              <div className="px-8 py-10">
                <div className="text-foreground">rest and self care</div>
                <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">
                  {thisWeekData ? (() => {
                    const activeHours = thisWeekData.averageProductiveHours;
                    const restHours = activeHours > 12 ? 24 - activeHours : Math.min(12, 24 - activeHours);
                    return formatHours(restHours * 60);
                  })() : '12'} hours
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold my-6 text-foreground">Consistence Steak</h2>
            <div
              className="
                        bg-[hsl(var(--wallet-fill))] border border-[hsl(var(--wallet-border))] rounded-md
                        flex flex-row gap-4 items-center justify-center
                        h-48 w-[600px]
                    "
            >
              <div className="px-8 py-10">
                <div className="text-foreground">last week</div>
                <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">
                  {lastWeekData?.streak || 0} days
                </div>
              </div>

              <div className="px-8 py-10">
                <div className="text-foreground">this week</div>
                <div className="text-[hsl(var(--primary-green))] font-semibold text-5xl">
                  {thisWeekData?.streak || 0} days
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
