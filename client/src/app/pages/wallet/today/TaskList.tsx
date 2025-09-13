import React, { useState } from 'react';
import Modal from '@/components/ui/Modal'; // Assuming Modal is a reusable component
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import axios from 'axios';

const TaskList = ({ tasks, categories, refreshTaskList }: { tasks: any[]; categories: Record<string, { name: string; color?: string }> ; refreshTaskList: () => void }) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTask, setEditedTask] = useState<any | null>(null);

  const handleDoubleClick = (task: any) => {
    setEditingTaskId(task._id);
    setEditedTask({ ...task });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedTask((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!editedTask || !editingTaskId) return;

    try {
      console.log('Edited Task:', editedTask);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please log in.');
        return;
      }

      // Extract date part (YYYY-MM-DD) from editedTask.date
      const datePart = editedTask.date.split('T')[0];

      // Combine date and time, then convert to UTC ISO strings
      const startUTC = new Date(`${datePart}T${editedTask.startHHMM}:00`).toISOString();
      const endUTC = new Date(`${datePart}T${editedTask.endHHMM}:00`).toISOString();

      const updatedTask = {
        ...editedTask,
        start: startUTC,
        end: endUTC,
      };

      console.log('Updated Task Payload:', updatedTask);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.patch(
        `http://localhost:5001/api/tasks/${editingTaskId}`,
        updatedTask,
        config
      );

      console.log('Task updated successfully:', response.data);
      setEditingTaskId(null);
      setEditedTask(null);

      // Refresh task list after successful update
      refreshTaskList();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task.');
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
        alert('Authentication token not found. Please log in.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const updatedTask = { done: !currentDone };

      const response = await axios.patch(
        `http://localhost:5001/api/tasks/${taskId}`,
        updatedTask,
        config
      );

      console.log('Task done status toggled successfully:', response.data);

      // Refresh task list after successful update
      refreshTaskList();
    } catch (error) {
      console.error('Error toggling task done status:', error);
      alert('Failed to toggle task done status.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Task List</h2>
      <div className="max-h-[340px] overflow-y-auto">
        {tasks.map((task) => (
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

            <div className="col-span-3" style={{ color: task.color }}>
              {categories[task.categoryId]?.name || 'Unknown Category'}
            </div>

            <div className="col-span-2">{task.startHHMM}</div>
            <div className="col-span-2">{task.endHHMM}</div>
          </div>
        ))}
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
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editedTask?.title || ''}
                  onChange={handleChange}
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="relative">
                  <Select
                    value={editedTask?.categoryId || ''}
                    onValueChange={(value) => {
                      setEditedTask((prev: any) => ({ ...prev, categoryId: value }));
                    }}
                  >
                    <SelectTrigger className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categories).map(([id, { name, color }]) => (
                        <SelectItem key={id} value={id} className="text-sm" style={{ color }}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  name="startHHMM"
                  value={editedTask?.startHHMM || ''}
                  onChange={handleChange}
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
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
                onClick={() => setEditingTaskId(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Logic to delete the task
                  console.log('Delete task:', editedTask);
                  setEditingTaskId(null);
                  setEditedTask(null);
                }}
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
