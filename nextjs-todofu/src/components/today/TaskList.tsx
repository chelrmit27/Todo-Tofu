'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Task {
  _id: string;
  title: string;
  categoryId: string;
  start: string;
  end: string;
  notes?: string;
  status: string;
  color?: string;
  startHHMM?: string;
  endHHMM?: string;
}

interface Category {
  name: string;
  color?: string;
}

interface TaskListProps {
  tasks: Task[];
  categories: Record<string, Category>;
  refreshTaskList: () => void;
}

export default function TaskList({ tasks, categories, refreshTaskList }: TaskListProps) {
  const handleCompleteTask = async (taskId: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: 'completed' });
      refreshTaskList();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        refreshTaskList();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tasks for today yet. Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Today&apos;s Tasks</h2>
      
      {tasks.map((task) => {
        const category = categories[task.categoryId];
        
        return (
          <div
            key={task._id}
            className={`p-4 rounded-lg border ${
              task.status === 'completed' ? 'bg-muted opacity-60' : 'bg-card'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category?.color || '#gray' }}
                  />
                  <h3 className={`font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  {category && (
                    <span className="px-2 py-1 text-xs bg-muted rounded-full">
                      {category.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>
                    {task.startHHMM} - {task.endHHMM}
                  </span>
                  {task.notes && (
                    <span>• {task.notes}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteTask(task._id)}
                  >
                    Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteTask(task._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
