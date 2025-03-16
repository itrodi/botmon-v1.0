import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

const Header = ({ 
  title = "Botmon Dashboard",
  userName = "Ahmad Garba",
  businessName = "Ahmad's Gadget",
  userImage = "/api/placeholder/40/40"
}) => {
  const navigate = useNavigate();

  // Format current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    // Any other cleanup needed
    
    // Redirect to login page
    navigate('/login');
  };

  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <img
          src={userImage}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{userName}</div>
          <div className="text-xs text-gray-500">{businessName}</div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <Link
           to="/ManageStore"
      >
          <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />

          <Link
           to="#"
      >
          <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        {/* Desktop and Tablet Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <h1 className="text-xl font-semibold text-gray-900 lg:pl-0 pl-12">{title}</h1>
            
            <div className="max-w-md flex-1 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 w-full bg-gray-50 border-gray-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-gray-600">{getCurrentDate()}</span>
            
            <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500">{businessName}</div>
              </div>
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden flex items-center justify-between">
          <div className="w-full pl-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search"
                className="pl-10 w-full bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <ProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;