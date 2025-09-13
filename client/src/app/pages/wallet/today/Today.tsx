import React, { useState, useEffect } from 'react';
import NewTask from './NewTask';
import TaskList from './TaskList';
import { api } from '@/lib/api';

const Today = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    Record<string, { name: string; color?: string }>
  >({});

  const fetchTasksAndCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in local storage');
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Fetch categories
      const categoryResponse = await api.get('/categories');
      const transformedCategories = categoryResponse.data.reduce(
        (
          acc: Record<string, { name: string; color?: string }>,
          category: any,
        ) => {
          acc[category._id] = { name: category.name, color: category.color };
          return acc;
        },
        {},
      );
      setCategories(transformedCategories);

      // Fetch tasks
      const today = new Date().toISOString().split('T')[0];
      const taskResponse = await api.get(`/tasks?date=${today}`);
      const tasksWithColors = taskResponse.data.tasks.map((task: any) => {
        const category = transformedCategories[task.categoryId];

        // Convert start and end times to HH:mm format
        const formatTime = (dateString: string) => {
          const date = new Date(dateString);
          const hours = date.getHours();
          const formattedHours = hours.toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${formattedHours}:${minutes}`;
        };

        return {
          ...task,
          color: category?.color || 'unknown',
          startHHMM: formatTime(task.start),
          endHHMM: formatTime(task.end),
        };
      });

      setTasks(tasksWithColors);
    } catch (error) {
      console.error('Error fetching categories or tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasksAndCategories();
  }, []);

  const refreshTaskList = () => {
    fetchTasksAndCategories();
  };

  return (
    <div className="py-6 px-16 bg-[hsl(var(--page-bg))] h-screen flex flex-col">
      <h1 className="text-3xl font-semibold">Today Activities</h1>
      <div className="text-base mt-2 mb-6">
        Manage your habits, reminders, events, activites
      </div>

      <NewTask refreshTaskList={refreshTaskList} />

      <TaskList
        tasks={tasks}
        categories={categories}
        refreshTaskList={refreshTaskList}
      />
    </div>
  );
};

export default Today;
