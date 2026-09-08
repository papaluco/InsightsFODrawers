import primeroLogo from '../../assets/Primero.ico';
import UserMenu from './UserMenu';

const HeaderMenu = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10">
      {/* Left side: Bold District Title */}
      <div className="flex items-center">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Mercer County Schools
        </h2>
      </div>

      {/* Right side: Branding and Initials */}
      <div className="flex items-center gap-6">
        {/* PrimeroEdge Icon */}
        <div className="flex items-center">
          <img 
            src={primeroLogo}
            alt="PrimeroEdge" 
            className="w-8 h-8 object-contain"
          />
        </div>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
};

export default HeaderMenu;