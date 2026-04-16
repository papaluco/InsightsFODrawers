import React, { useState } from 'react';
import { Bot, BarChart3, User, ArrowRight } from 'lucide-react';
import { AIConfigDrawer } from '../components/AI/AIConfigDrawer';

const SettingPage = () => {
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  return (
    <div className="min-h-full">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings Hub</h1>
        <p className="text-gray-500 mt-1">Manage your platform intelligence and data rules.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Card */}
        <div 
          onClick={() => setIsAIDrawerOpen(true)}
          className="group bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Bot size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Configuration</h3>
          <p className="text-gray-500 text-sm mb-6">Fine-tune model parameters and personas.</p>
          <div className="text-purple-600 font-semibold flex items-center gap-2">
            Configure <ArrowRight size={16} />
          </div>
        </div>
      </div>

      {/* Independent Drawer Component */}
      <AIConfigDrawer 
        isOpen={isAIDrawerOpen} 
        onClose={() => setIsAIDrawerOpen(false)} 
      />
    </div>
  );
};

export default SettingPage;