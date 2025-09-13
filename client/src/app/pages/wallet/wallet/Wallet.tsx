import React from 'react';
import YourWallet from './YourWallet';
import Reminder from './Reminder';

const Wallet = () => {
  return (
    <div className="py-6 px-16 bg-[hsl(var(--page-bg))] h-screen flex flex-col">
      <h1 className="text-3xl font-semibold">Manage Time Wallet</h1>
      <div className="text-base mt-2 mb-6">
        Balance habits, reminders, events, activites
      </div>

      <YourWallet />
      <Reminder />
    </div>
  );
};

export default Wallet;
