'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  _id: string;
  name: string;
  color?: string;
}

interface NewTaskProps {
  refreshTaskList: () => void;
}

export default function NewTask({ refreshTaskList }: NewTaskProps) {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
        setCategories(transformedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use local date instead of UTC date
      const today = new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD format in local timezone
      const startDateTime = `${today}T${formData.startHHMM}:00.000Z`;
      const endDateTime = `${today}T${formData.endHHMM}:00.000Z`;

      const taskData = {
        title: formData.title,
        categoryId: formData.categoryId,
        start: startDateTime,
        end: endDateTime,
        notes: formData.notes,
        status: 'pending',
      };

      await api.post('/tasks', taskData);
      
      // Reset form
      setFormData({
        title: '',
        categoryId: '',
        startHHMM: '',
        endHHMM: '',
        notes: '',
      });
      
      // Refresh task list
      refreshTaskList();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-lg border">
      <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="categoryId">Category</Label>
            <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([id, category]) => (
                  <SelectItem key={id} value={id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startHHMM">Start Time</Label>
            <Input
              id="startHHMM"
              name="startHHMM"
              type="time"
              value={formData.startHHMM}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="endHHMM">End Time</Label>
            <Input
              id="endHHMM"
              name="endHHMM"
              type="time"
              value={formData.endHHMM}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Input
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Add notes..."
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding Task...' : 'Add Task'}
        </Button>
      </form>
    </div>
  );
}
