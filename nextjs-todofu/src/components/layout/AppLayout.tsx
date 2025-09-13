'use client';

import React from 'react';
import TaskTab from '../wallet/TaskTab';
import { CategoryProvider } from '@/context/CategoryContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <CategoryProvider>
      <div className="flex">
        <TaskTab />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </CategoryProvider>
  );
};

export default AppLayout;
