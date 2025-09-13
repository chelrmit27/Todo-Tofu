import React from 'react';
import { useState, useEffect } from 'react';
import { api } from '../../../../lib/api';

const PendingTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<
    Record<string, { name: string; color?: string }>
  >({});
  const [loading, setLoading] = useState(true);

  const fetchCategoriesAndTasks = async () => {
    try {
      setLoading(true);
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
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedDate = yesterday.toISOString().split('T')[0];
      //const formattedDate = '2025-09-09'
      const taskResponse = await api.get(
        `/tasks?date=${formattedDate}&done=false`
      );
      const tasksWithColors = taskResponse.data.tasks.map((task: any) => {
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

      // Console log tasks with their colors
      console.log('Tasks with colors:', tasksWithColors);
    } catch (error) {
      console.error('Error fetching categories or tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndTasks();
  }, []);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in local storage');
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in local storage');
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

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

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Pending Tasks</h2>
        <div>Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">Pending Tasks</h2>
        <div>
          No pending tasks. Well done.
          <div className="flex flex-row justify-center">
            <img src="/tofu/Sleepy.png" className="w-72 h-72 object-cover" />
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
          {tasks.map((task) => (
            <div
              key={task._id}
              className="grid grid-cols-12 gap-4 py-2 mb-1 border border-gray-400 rounded-sm"
            >
              <div className="col-span-5">
                <input
                  type="checkbox"
                  className="ml-3 mr-6"
                  checked={!!task.selected} // Ensure a boolean value is always passed
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

              <div className="col-span-3" style={{ color: task.color }}>
                {categories[task.categoryId]?.name || 'Unknown Category'}
              </div>

              <div className="col-span-2">{task.startHHMM}</div>
              <div className="col-span-2">{task.endHHMM}</div>
            </div>
          ))}
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
