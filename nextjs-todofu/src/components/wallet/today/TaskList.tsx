'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { useWalletUtils } from '@/stores/useWalletUtils';
import { useCategoryContext } from '@/context/CategoryContext';
import toast from 'react-hot-toast';

interface Task {
  _id: string;
  title: string;
  categoryId: string;
  startHHMM: string;
  endHHMM: string;
  done: boolean;
  color: string;
  date: string;
}

const TaskList = ({
  tasks,
  refreshTaskList,
}: {
  tasks: Task[];
  refreshTaskList: () => void;
}) => {
  const { categories } = useCategoryContext();
  const { refreshWalletAfterTaskChange } = useWalletUtils();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  const handleDoubleClick = (task: Task) => {
    setEditingTaskId(task._id);
    setEditedTask({ ...task });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev: Task | null) => 
      prev ? { ...prev, [name]: value } : null
    );
  };

  const handleSave = async () => {
    if (!editedTask || !editingTaskId) return;

    try {
      console.log('Edited Task:', editedTask);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        return;
      }

      // Extract date part (YYYY-MM-DD) from editedTask.date
      const datePart = editedTask.date.split('T')[0];

      // Combine date and time, then convert to UTC ISO strings
      const startUTC = new Date(
        `${datePart}T${editedTask.startHHMM}:00`,
      ).toISOString();
      const endUTC = new Date(
        `${datePart}T${editedTask.endHHMM}:00`,
      ).toISOString();

      const updatedTask = {
        ...editedTask,
        start: startUTC,
        end: endUTC,
      };

      console.log('Updated Task Payload:', updatedTask);

      await api.patch(`/tasks/${editingTaskId}`, updatedTask);

      console.log('Task updated successfully');
      setEditingTaskId(null);
      setEditedTask(null);
      toast.success('Task updated successfully!');

      // Refresh both task list and wallet data
      refreshTaskList();
      await refreshWalletAfterTaskChange();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task.');
    }
  };

  const handleCancel = () => {
    setEditingTaskId(null);
    setEditedTask(null);
  };

  const handleToggleDone = async (taskId: string, currentDone: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        return;
      }

      const updatedTask = { done: !currentDone };

      await api.patch(`/tasks/${taskId}`, updatedTask);

      console.log('Task done status toggled successfully');
      toast.success('Task status updated!');

      // Refresh both task list and wallet data
      refreshTaskList();
      await refreshWalletAfterTaskChange();
    } catch (error) {
      console.error('Error toggling task done status:', error);
      toast.error('Failed to toggle task done status.');
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTaskId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please log in.');
        return;
      }

      await api.delete(`/tasks/${editingTaskId}`);

      console.log('Task deleted successfully');
      setEditingTaskId(null);
      setEditedTask(null);
      toast.success('Task deleted successfully!');

      // Refresh both task list and wallet data
      refreshTaskList();
      await refreshWalletAfterTaskChange();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task.');
    }
  };

  console.log('Loaded categories in TaskList:', categories);

  if (!categories || Object.keys(categories).length === 0) {
    return <div className="py-6 px-16">Loading categories...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Task List</h2>
      <div className="max-h-[340px] overflow-y-auto">
        {tasks.map((task) => {
          let catId = task.categoryId;
          if (typeof catId === 'object' && catId !== null && '_id' in catId) {
            catId = (catId as { _id: string })._id;
          }
          return (
            <div
              key={task._id}
              className="grid grid-cols-12 gap-4 py-2 mb-1 border border-gray-400 rounded-sm cursor-pointer"
              onDoubleClick={() => handleDoubleClick(task)}
            >
              <div className="col-span-5">
                <input
                  type="checkbox"
                  className="ml-3 mr-6"
                  checked={task.done}
                  onChange={() => handleToggleDone(task._id, task.done)}
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

      {editingTaskId && (
        <Modal isOpen={true} onClose={() => setEditingTaskId(null)}>
          <div
            className="p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <h3 className="text-xl font-semibold mb-4">Edit Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={editedTask?.title || ''}
                  onChange={handleChange}
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="relative">
                  <Select
                    value={editedTask?.categoryId || ''}
                    onValueChange={(value) => {
                      setEditedTask((prev: Task | null) => 
                        prev ? { ...prev, categoryId: value } : null
                      );
                    }}
                  >
                    <SelectTrigger className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startHHMM"
                  value={editedTask?.startHHMM || ''}
                  onChange={handleChange}
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  name="endHHMM"
                  value={editedTask?.endHHMM || ''}
                  onChange={handleChange}
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TaskList;
