'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, GraduationCap, Archive, Pencil } from 'lucide-react';

const TaskTab = () => {
  const pathname = usePathname();

  const getTabClassName = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center ${isActive ? 'text-purple-600' : 'text-foreground'} hover:text-purple-600`;
  };

  return (
    <div className="py-6 pl-8 pr-11 bg-[hsl(var(--task-tab-bg))] rounded-l-lg shadow-md h-screen">
      <h2 className="text-lg font-bold mb-4 text-foreground">Tabs</h2>
      <ul className="space-y-2">
        <li>
          <Link href="/app/wallet" className={getTabClassName('/app/wallet')}>
            <User className="w-6 h-6 mr-2" />
            Wallet
          </Link>
        </li>
        <li>
          <Link href="/app/today" className={getTabClassName('/app/today')}>
            <GraduationCap className="w-6 h-6 mr-2" />
            Today
          </Link>
        </li>
        <li>
          <Link
            href="/app/yesterday"
            className={getTabClassName('/app/yesterday')}
          >
            <Archive className="w-6 h-6 mr-2" />
            Yesterday
          </Link>
        </li>
        <li>
          <Link
            href="/app/edit-tags"
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
