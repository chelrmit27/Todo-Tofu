import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, GraduationCap, Archive, Pencil } from 'lucide-react';
import { useCategoryContext } from '../../../context/CategoryContext';
import axios from 'axios';
import Modal from '../../../components/ui/Modal';

const TaskTab = () => {
  const location = useLocation();
  
  const getTabClassName = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center ${isActive ? 'text-purple-600' : 'text-foreground'} hover:text-purple-600`;
  };

  return (
    <div className="py-6 pl-8 pr-11 bg-[hsl(var(--task-tab-bg))] rounded-l-lg shadow-md h-screen">
      <h2 className="text-lg font-bold mb-4 text-foreground">Tabs</h2>
      <ul className="space-y-2">
        <li>
          <Link
            to="/app/wallet"
            className={getTabClassName('/app/wallet')}
          >
            <User className="w-6 h-6 mr-2" />
            Wallet
          </Link>
        </li>
        <li>
          <Link
            to="/app/today"
            className={getTabClassName('/app/today')}
          >
            <GraduationCap className="w-6 h-6 mr-2" />
            Today
          </Link>
        </li>
        <li>
          <Link
            to="/app/yesterday"
            className={getTabClassName('/app/yesterday')}
          >
            <Archive className="w-6 h-6 mr-2" />
            Yesterday
          </Link>
        </li>
        <li>
          <Link
            to="/app/edit-tags"
            className={getTabClassName('/app/edit-tags')}
          >
            <Pencil className="w-6 h-6 mr-2" />
            Edit Tags
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TaskTab;
