import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal, LogOut } from 'lucide-react';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePreferences = () => {
    setIsOpen(false);
    navigate('/preferences');
  };

  const handleSignOut = () => {
    console.log('Sign out clicked');
    setIsOpen(false);
  };

  const apiVersion = '10.2';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center justify-center w-9 h-9 bg-indigo-600 rounded-full shadow-sm"
      >
        <span className="text-xs font-bold text-white tracking-tighter">
          HG
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
          <div className="py-1">
            <button
              type="button"
              onClick={handlePreferences}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              Preferences
            </button>
          </div>

          <div className="border-t border-gray-100 py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              Sign out
            </button>
          </div>

          <div className="border-t border-gray-100 px-4 py-2">
            <span className="text-xs text-gray-400">API v{apiVersion}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
