import React, { useState, useEffect } from 'react';
import { Grid, ShoppingBag, MessageSquare, CreditCard, Bell, Mail, Users, ClipboardList, BarChart, Settings, Menu, X } from 'lucide-react';

const SidebarLink = ({ href, icon: Icon, children, isActive, onClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    window.location.href = href;
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive 
          ? 'text-purple-600 bg-purple-50' 
          : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
        }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </a>
  );
};

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Get the current pathname and update on changes
    setCurrentPath(window.location.pathname);
    
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Function to check if a link is active
  const isLinkActive = (href) => {
    if (currentPath === href) return true;
    if (href !== '/' && currentPath.startsWith(href)) {
      const nextChar = currentPath[href.length];
      return !nextChar || nextChar === '/' || nextChar === '?';
    }
    return false;
  };

  // Navigation structure
  const navigationStructure = {
    mainMenu: [
      { href: '/Overview', icon: Grid, label: 'Overview' },
      { href: '/ProductPage', icon: ShoppingBag, label: 'Product Page' },
      { href: '/Chatbot', icon: MessageSquare, label: 'Chat Bot' },
      { href: '/Payments', icon: CreditCard, label: 'Payment' }
    ],
    socialPage: [
      { href: '/Notifications', icon: Bell, label: 'Notification' },
      { href: '/Messages', icon: Mail, label: 'Messages' }
    ],
    others: [
      { href: '/Customers', icon: Users, label: 'Customers' },
      { href: '/Orders', icon: ClipboardList, label: 'Orders' },
      { href: '/Bookings', icon: BarChart, label: 'Bookings' },
      { href: '/ManageStore', icon: Settings, label: 'Settings' }
    ]
  };

  const NavigationSection = ({ title, items, onLinkClick }) => (
    <div className="space-y-1">
      <div className="px-4 py-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      {items.map((item) => (
        <SidebarLink 
          key={item.href}
          href={item.href} 
          icon={item.icon} 
          isActive={isLinkActive(item.href)}
          onClick={onLinkClick}
        >
          {item.label}
        </SidebarLink>
      ))}
    </div>
  );

  const SidebarContent = ({ onLinkClick }) => (
    <>
      <div className="p-4 border-b border-gray-200">
        <img src="/Images/botmon-logo.png" alt="Logo" className="h-8" />
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavigationSection 
          title="MAIN MENU" 
          items={navigationStructure.mainMenu}
          onLinkClick={onLinkClick}
        />
        <div className="mt-6">
          <NavigationSection 
            title="SOCIAL PAGE" 
            items={navigationStructure.socialPage}
            onLinkClick={onLinkClick}
          />
        </div>
        <div className="mt-6">
          <NavigationSection 
            title="OTHERS" 
            items={navigationStructure.others}
            onLinkClick={onLinkClick}
          />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Hidden completely on mobile */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white h-screen flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed left-4 top-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Overlay and Sidebar - Only renders when open */}
      {isMobileMenuOpen && (
        <>
          {/* Dark overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile sidebar panel */}
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <img src="/Images/botmon-logo.png" alt="Logo" className="h-8" />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <NavigationSection 
                title="MAIN MENU" 
                items={navigationStructure.mainMenu}
                onLinkClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="mt-6">
                <NavigationSection 
                  title="SOCIAL PAGE" 
                  items={navigationStructure.socialPage}
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
              <div className="mt-6">
                <NavigationSection 
                  title="OTHERS" 
                  items={navigationStructure.others}
                  onLinkClick={() => setIsMobileMenuOpen(false)}
                />
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;