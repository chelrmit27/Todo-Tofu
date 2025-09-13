import React from 'react';
import { Outlet } from 'react-router-dom';
import TaskTab from './TaskTab';
import { CategoryProvider } from '../../../context/CategoryContext';

const Home = () => {
  return (
    <CategoryProvider>
      <div className="bg-[hsl(var(--navbar-bg))] h-screen flex flex-row">
        <div>
          <TaskTab />
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </CategoryProvider>
  );
};

export default Home;
