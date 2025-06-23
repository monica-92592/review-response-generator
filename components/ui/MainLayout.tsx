import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import Container from './Container';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
  headerProps?: {
    onThemeToggle?: () => void;
    isDarkMode?: boolean;
  };
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showSidebar = true,
  headerProps = {}
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className={cn(
      'min-h-screen bg-background',
      'flex flex-col',
      className
    )}>
      {/* Header */}
      <AppHeader
        onMenuToggle={handleMenuToggle}
        isMenuOpen={isMenuOpen}
        {...headerProps}
      />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            isOpen={isMenuOpen}
            onClose={handleMenuClose}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          'flex-1',
          'min-h-0', // Prevents flex item from overflowing
          showSidebar && 'lg:ml-64' // Account for sidebar width on large screens
        )}>
          <Container className="h-full">
            {children}
          </Container>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 