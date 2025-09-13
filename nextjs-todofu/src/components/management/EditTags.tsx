'use client';

import React, { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { api } from '@/lib/api';
import Modal from '@/components/ui/Modal';
import useCategoriesStore from '@/stores/useCategoriesStore';

const EditTags = () => {
  const { categories, fetchCategories } = useCategoriesStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCategory, setEditedCategory] = useState({ name: '', color: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', color: '' });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const availableColors = Array.from(
    new Set(
      categories
        .map((category) => category.color)
        .filter(Boolean),
    ),
  );

  const handleDoubleClick = (id: string) => {
    const category = categories.find(cat => cat._id === id);
    if (category) {
      setSelectedCategory(id);
      setEditedCategory({
        name: category.name,
        color: category.color || '',
      });
      setIsModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (selectedCategory) {
      try {
        await api.patch(`/categories/${selectedCategory}`, editedCategory);
        await fetchCategories(); // Refresh categories
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error updating category:', error);
        alert('Failed to update category.');
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCategory) {
      try {
        await api.delete(`/categories/${selectedCategory}`);
        await fetchCategories(); // Refresh categories
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category.');
      }
    }
  };

  const handleAddCategory = async () => {
    try {
      const response = await api.post('/categories', newCategory);
      if (response.status === 201) {
        alert('Category added successfully!');
        await fetchCategories(); // Refresh categories
        setIsAddModalOpen(false);
        setNewCategory({ name: '', color: '' });
      }
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category.');
    }
  };

  return (
    <div className="py-6 px-16 bg-[hsl(var(--page-bg))] h-screen flex flex-col">
      <h1 className="text-3xl font-semibold">Your Tags</h1>
      <div className="text-base mt-2 mb-6">Double click to edit your tags</div>

      <ul className="space-y-5 border border-[hsl(0_0%_60%)] p-4 rounded-lg bg-card">
        {categories.map((category) => (
          <li
            key={category._id}
            className="flex items-center cursor-pointer text-card-foreground"
            onDoubleClick={() => handleDoubleClick(category._id)}
          >
            <Tag className="w-6 h-6 mr-2" style={{ color: category.color }} />
            {category.name}
          </li>
        ))}
      </ul>

      <div className="flex justify-end my-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[hsl(var(--primary-green))] text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg font-medium"
        >
          Add Tag
        </button>
      </div>

      {isModalOpen && (
        <Modal isOpen={true} onClose={() => setIsModalOpen(false)}>
          <div
            className="p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
            <input
              type="text"
              value={editedCategory.name}
              onChange={(e) =>
                setEditedCategory({ ...editedCategory, name: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex gap-2 mb-4">
              {availableColors.map((color) => (
                <div
                  key={color}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: color,
                    border:
                      editedCategory.color === color
                        ? '2px solid black'
                        : 'none',
                  }}
                  onClick={() =>
                    setEditedCategory({ ...editedCategory, color: color || '' })
                  }
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal isOpen={true} onClose={() => setIsAddModalOpen(false)}>
          <div
            className="p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex gap-2 mb-4">
              {availableColors.map((color) => (
                <div
                  key={color}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: color,
                    border:
                      newCategory.color === color ? '2px solid black' : 'none',
                  }}
                  onClick={() =>
                    setNewCategory({ ...newCategory, color: color || '' })
                  }
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddCategory}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg font-medium"
              >
                Add Category
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 hover:shadow-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EditTags;
