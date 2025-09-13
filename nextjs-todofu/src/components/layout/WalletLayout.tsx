'use client';

import TaskTab from '@/components/layout/TaskTab';

export default function WalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[hsl(var(--navbar-bg))] h-screen flex flex-row">
      <div>
        <TaskTab />
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
