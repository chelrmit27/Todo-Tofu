'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useCategoryContext } from '@/context/CategoryContext';

interface Task {
  _id: string;
  title: string;
  categoryId: string;
  start: string;
  end: string;
  done: boolean;
  selected?: boolean;
  color?: string;
  startHHMM?: string;
  endHHMM?: string;
}

const PendingTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { categories } = useCategoryContext();
  const [loading, setLoading] = useState(true);

  const fetchCategoriesAndTasks = async () => {
    try {
      setLoading(true);

      // Fetch tasks for yesterday using local date calculation
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 1); // Go back one day
      
      // Use local date instead of UTC to avoid timezone issues
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const yesterdayDateString = `${year}-${month}-${day}`;
      
      const taskResponse = await api.get(`/tasks?date=${yesterdayDateString}&done=false`);
      const tasksData = taskResponse.data.tasks || taskResponse.data;
      
      const tasksWithColors = tasksData.map((task: Task) => {
        const category = categories[task.categoryId];

        // Convert start and end times to HH:mm format
        const formatTime = (dateString: string) => {
          const date = new Date(dateString);
          const hours = date.getHours();
          const formattedHours = hours.toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          const period = hours >= 12 ? 'PM' : 'AM';
          return `${formattedHours}:${minutes} ${period}`;
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async () => {
    try {
      const updatedTasks = tasks.filter((task) => task.selected);
      await Promise.all(
        updatedTasks.map((task) =>
          api.patch(`/tasks/${task._id}`, { done: true })
        ),
      );

      setTasks((prevTasks) => prevTasks.filter((task) => !task.selected));
    } catch (error) {
      console.error('Error updating tasks as done:', error);
    }
  };

  const handlePutBack = async () => {
    try {
      const today = new Date();
      const updatedTasks = tasks.filter((task) => task.selected);
      await Promise.all(
        updatedTasks.map((task) => {
          const start = new Date(task.start);
          const end = new Date(task.end);

          // Update only the date part to today's date
          start.setFullYear(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );
          end.setFullYear(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );

          return api.patch(`/tasks/${task._id}`, {
            start: start.toISOString(),
            end: end.toISOString(),
          });
        }),
      );

      // Reload tasks after updates
      fetchCategoriesAndTasks();
    } catch (error) {
      console.error('Error updating tasks to today:', error);
    }
  };

  console.log('Loaded categories in PendingTasks:', categories);

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Pending Tasks</h2>
        <div>Loading tasks...</div>
      </div>
    );
  }

  if (!categories || Object.keys(categories).length === 0) {
    return <div className="py-6 px-16">Loading categories...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Pending Tasks</h2>
        <div>
          No pending tasks. Well done.
          <div className="flex flex-row justify-center">
            <Image src="/tofu/Sleepy.png" alt="Sleepy Tofu" width={288} height={288} className="object-cover" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Pending Tasks</h2>
      <div>
        <div className="max-h-[400px] overflow-y-auto">
          {tasks.map((task) => {
            let catId = task.categoryId;
            if (typeof catId === 'object' && catId !== null && '_id' in catId) {
              catId = (catId as { _id: string })._id;
            }
            return (
              <div
                key={task._id}
                className="grid grid-cols-12 gap-4 py-2 mb-1 border border-gray-400 rounded-sm"
              >
                <div className="col-span-5">
                  <input
                    type="checkbox"
                    className="ml-3 mr-6"
                    checked={!!task.selected}
                    onChange={(e) => {
                      setTasks((prevTasks) =>
                        prevTasks.map((t) =>
                          t._id === task._id
                            ? { ...t, selected: e.target.checked }
                            : t,
                        ),
                      );
                    }}
                  />
                  {task.title}
                </div>

                <div className="col-span-3" style={{ color: categories[catId]?.color }}>
                  {categories[catId]?.name || 'Unknown Category'}
                </div>

                <div className="col-span-2">{task.startHHMM}</div>
                <div className="col-span-2">{task.endHHMM}</div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-row justify-end gap-3 mt-6">
          <button
            className="bg-[hsl(var(--pending-task-bg))] px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg w-32 font-medium"
            onClick={handlePutBack}
          >
            Put Back
          </button>

          <button
            className="bg-[hsl(var(--overdue-task-bg))] px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg w-32 font-medium"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTasks;
