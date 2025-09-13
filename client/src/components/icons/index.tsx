import React from 'react';
import {
  Home as LucideHomeIcon,
  Calendar as LucideCalendarIcon,
  Settings as LucideSettingsIcon,
  Moon as LucideMoonIcon,
  BarChart2 as LucideAnalyticsIcon,
  LogOut as LucideLogoutIcon,
} from 'lucide-react';

export const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <LucideHomeIcon className={className} />
);

export const CalendarIcon: React.FC<{ className?: string }> = ({
  className,
}) => <LucideCalendarIcon className={className} />;

export const SettingsIcon: React.FC<{ className?: string }> = ({
  className,
}) => <LucideSettingsIcon className={className} />;

export const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <LucideMoonIcon className={className} />
);

export const AnalyticsIcon: React.FC<{ className?: string }> = ({
  className,
}) => <LucideAnalyticsIcon className={className} />;

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <LucideLogoutIcon className={className} />
);
