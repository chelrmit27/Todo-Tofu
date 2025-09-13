'use client';

import React from 'react';
import PendingTasks from './PendingTasks';

const Yesterday = () => {
  return (
    <div className="py-6 px-16 bg-[hsl(var(--page-bg))] h-screen flex flex-col">
      <h1 className="text-3xl font-semibold">Pick Up Where You Left Off</h1>
      <div className="text-base mt-2 mb-6">
        Unfinished tasks you can bring forward into today
      </div>

      <PendingTasks />
    </div>
  );
};

export default Yesterday;
