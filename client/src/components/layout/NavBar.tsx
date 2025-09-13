import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  CalendarIcon,
  AnalyticsIcon,
  SettingsIcon,
  LogoutIcon,
} from '@/components/icons';
import { ModeToggle } from '@/components/ui/mode-toggle';

export const NavBar: React.FC = () => {
  const location = useLocation();
  
  const getIconClassName = (path: string) => {
    let isActive = false;
    
    // Special handling for home icon - it should be active for wallet routes
    if (path === '/') {
      isActive = location.pathname === '/app/wallet' || location.pathname.startsWith('/app/wallet') || 
                 location.pathname === '/app/today' || location.pathname === '/app/yesterday' || 
                 location.pathname === '/app/edit-tags';
    } else {
      isActive = location.pathname === path;
    }
    
    return `w-6 h-6 ${isActive ? 'text-[#FFE200] dark:text-[#FFE200]' : 'text-foreground hover:text-[#FFE200] dark:hover:text-[#FFE200]'}`;
  };

  return (
    <nav className="h-screen w-16 bg-[hsl(var(--navbar-bg))] flex flex-col justify-between items-stretch py-6">
      {/* Top icons */}
      <div className="flex flex-col items-center space-y-6">
        <Link to="/app/wallet">
          <HomeIcon className={getIconClassName('/')} />
        </Link>
        <Link to="/app/calendar">
          <CalendarIcon className={getIconClassName('/app/calendar')} />
        </Link>
        <Link to="/app/analytics">
          <AnalyticsIcon className={getIconClassName('/app/analytics')} />
        </Link>
      </div>

      {/* Bottom icons */}
      <div className="flex flex-col items-center space-y-6">
        {/* <Link to="/settings">
          <SettingsIcon className="w-6 h-6 text-black" />
        </Link> */}
        <ModeToggle />
        <Link to="/app/logout">
          <LogoutIcon className={getIconClassName('/app/logout')} />
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
