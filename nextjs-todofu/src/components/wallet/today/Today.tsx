'use client';

import React, { useState, useEffect } from 'react';
import NewTask from './NewTask';
import TaskList from './TaskList';
import { api } from '@/lib/api';

interface Task {
  _id: string;
  title: string;
  categoryId: string;
  startHHMM: string;
  endHHMM: string;
  done: boolean;
  color: string;
  date: string;
  start: string;
  end: string;
  description?: string;
}

interface Category {
  _id: string;
  name: string;
  color: string;
}

const Today = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  // const [categories, setCategories] = useState<
  //   Record<string, { name: string; color?: string }>
  // >({});

  const fetchTasksAndCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in local storage');
      }

      // Fetch categories
      const categoryResponse = await api.get('/categories');
      const transformedCategories = categoryResponse.data.reduce(
        (
          acc: Record<string, { name: string; color?: string }>,
          category: Category,
        ) => {
          acc[category._id] = { name: category.name, color: category.color };
          return acc;
        },
        {},
      );
      // setCategories(transformedCategories);

      // Fetch tasks - use local date instead of UTC to avoid timezone issues
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const taskResponse = await api.get(`/tasks?date=${today}`);
      
      const tasksWithColors = taskResponse.data.tasks.map((task: Task) => {
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
        Manage your habits, reminders, events, activities
      </div>

      <NewTask refreshTaskList={refreshTaskList} />

      <TaskList
        tasks={tasks}
        refreshTaskList={refreshTaskList}
      />
    </div>
  );
};

export default Today;
