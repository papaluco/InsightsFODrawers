import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  Bot, 
  FileText, 
  BookOpen,
  ChefHat
} from 'lucide-react';

const SidebarMenu = () => {
  const menuItems = [
    { name: 'Workspace', icon: LayoutDashboard, path: '/' },
    { name: 'Insights', icon: BarChart3, path: '/insights' },
    { name: 'Menu Analysis', icon: ChefHat, path: '/menu-analysis' },
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Learning', icon: BookOpen, path: '/learning' },
    { name: 'AI Assistant', icon: Bot, path: '/chat' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      {/* Branding Area */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-indigo-600 font-bold text-xl">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <LayoutDashboard size={24} />
          </div>
          <span className="tracking-tight text-gray-900">Workspace</span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-indigo-600' : 'group-hover:text-indigo-600'
                }`} />
                <span className="text-sm">{item.name}</span>
                
                {/* Active Indicator Dot - Corrected Logic 
                {isActive && ( <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" /> )} */}
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default SidebarMenu;