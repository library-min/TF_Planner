import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:pl-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;