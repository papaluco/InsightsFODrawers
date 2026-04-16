import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './SidebarMenu';
import Header from './HeaderMenu';

const LayoutMen = () => {
  return (
    /* Restored bg-gray-50 for the consistent app background */
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet /> 
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutMen;