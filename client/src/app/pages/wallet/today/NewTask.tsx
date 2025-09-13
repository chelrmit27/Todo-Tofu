import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import axios from 'axios';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

const NewTask = ({ refreshTaskList }: { refreshTaskList: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    startHHMM: '',
    endHHMM: '',
    notes: '',
  });
  const [categories, setCategories] = useState<
    Record<string, { name: string; color?: string }>
  >({});

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const categoryResponse = await axios.get(
          'http://localhost:5001/api/categories',
          config,
        );
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
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Failed to fetch categories.');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const requestBody = {
      ...formData,
      date: today,
      isEvent: false,
      isReminder: false,
      carryover: false,
    };

    try {
      const response = await fetch('http://localhost:5001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        alert('Task added successfully!');
        setFormData({
          title: '',
          categoryId: '',
          startHHMM: '',
          endHHMM: '',
          notes: '',
        });
        refreshTaskList();
      } else {
        const errorData = await response.json();
        alert(`Failed to add task: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('An error occurred while adding the task.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">New Task</h2>

      <div
        className="
          flex flex-col
          new-task-form-bg rounded-lg 
          p-7 mb-6
        "
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <label
                htmlFor="title"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Task Title:
              </label>
              <div className="relative">
                <input
                  id="title"
                  name="title"
                  placeholder="Enter Task Title"
                  value={formData.title}
                  onChange={handleChange}
                  className="new-task-input-bg border border-border text-foreground text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
            </div>

            <div className="col-span-3">
              <label
                htmlFor="categoryId"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Category:
              </label>
              <div className="relative">
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, categoryId: value }));
                  }}
                >
                  <SelectTrigger className="new-task-input-bg border border-border text-foreground text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 flex items-center justify-between">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([id, { name, color }]) => (
                      <SelectItem
                        key={id}
                        value={id}
                        className="text-sm"
                        style={{ color }}
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="col-span-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startHHMM"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Start time:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="startHHMM"
                    name="startHHMM"
                    value={formData.startHHMM}
                    onChange={handleChange}
                    className="new-task-input-bg border border-border text-foreground text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="endHHMM"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  End time:
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="endHHMM"
                    name="endHHMM"
                    value={formData.endHHMM}
                    onChange={handleChange}
                    className="new-task-input-bg border border-border text-foreground text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-end pt-3">
            <button
              type="submit"
              className="bg-[hsl(var(--button-primary))] px-8 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg text-white font-medium"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTask;
