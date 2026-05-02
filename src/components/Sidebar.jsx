import React, { useState, useEffect } from 'react';
import { Grid, ShoppingBag, MessageSquare, CreditCard, Bell, Mail, Users, ClipboardList, BarChart, Settings, BookOpen } from 'lucide-react';

const SidebarLink = ({ href, icon: Icon, children, isActive, onClick, dataTour }) => {
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
      data-tour={dataTour}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${isActive 
          ? 'text-purple-600 bg-purple-50' 
          : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'
        }`}
    >
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span>{children}</span>
    </a>
  );
};

const Sidebar = () => {
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
      { href: '/Overview', icon: Grid, label: 'Overview', dataTour: 'nav-overview' },
      { href: '/ProductPage', icon: ShoppingBag, label: 'Product Page', dataTour: 'nav-products' },
      { href: '/Chatbot', icon: MessageSquare, label: 'Chat Bot', dataTour: 'nav-chatbot' },
      { href: '/Payments', icon: CreditCard, label: 'Payment', dataTour: 'nav-payments' }
    ],
    socialPage: [
      { href: '/Notifications', icon: Bell, label: 'Notification', dataTour: 'nav-notifications' },
      { href: '/Messages', icon: Mail, label: 'Messages', dataTour: 'nav-messages' }
    ],
    others: [
      { href: '/Customers', icon: Users, label: 'Customers', dataTour: 'nav-customers' },
      { href: '/Orders', icon: ClipboardList, label: 'Orders', dataTour: 'nav-orders' },
      { href: '/Bookings', icon: BarChart, label: 'Bookings', dataTour: 'nav-bookings' },
      { href: '/ManageStore', icon: Settings, label: 'Settings', dataTour: 'nav-settings' },
      { href: '/Documentation', icon: BookOpen, label: 'Documentation', dataTour: 'nav-documentation' }
    ]
  };

  const NavigationSection = ({ title, items }) => (
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
          dataTour={item.dataTour}
        >
          {item.label}
        </SidebarLink>
      ))}
    </div>
  );

  // Only render on desktop (md and above)
  return (
    <aside
      aria-label="Main navigation"
      className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white h-screen flex-shrink-0"
    >
      <div className="p-4 border-b border-gray-200">
        <img src="/Images/botmon-logo.png" alt="Botmon" className="h-8" />
      </div>
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Primary">
        <NavigationSection
          title="MAIN MENU"
          items={navigationStructure.mainMenu}
        />
        <div className="mt-6">
          <NavigationSection
            title="SOCIAL PAGE"
            items={navigationStructure.socialPage}
          />
        </div>
        <div className="mt-6">
          <NavigationSection
            title="OTHERS"
            items={navigationStructure.others}
          />
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
