import React, { useState } from 'react';
import { Grid, ShoppingBag, MessageSquare, CreditCard, Bell, Mail, MessageCircle, Users, ClipboardList, BarChart, Settings, Menu, X } from 'lucide-react';

const SidebarLink = ({ href, icon: Icon, children, isActive }) => {
  return (
    <a
      href={href}
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

const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Mobile Menu Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <span className="font-bold text-xl">BOTMON</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="py-4">
          {/* Main Menu */}
          <div className="space-y-1">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                MAIN MENU
              </span>
            </div>
            <SidebarLink href="/dashboard" icon={Grid} isActive={true}>Overview</SidebarLink>
            <SidebarLink href="/dashboard/products" icon={ShoppingBag}>Product Page</SidebarLink>
            <SidebarLink href="/dashboard/chat" icon={MessageSquare}>Chat Bot</SidebarLink>
            <SidebarLink href="/dashboard/payment" icon={CreditCard}>Payment</SidebarLink>
          </div>

          {/* Social Page */}
          <div className="space-y-1 mt-6">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                SOCIAL PAGE
              </span>
            </div>
            <SidebarLink href="/dashboard/notifications" icon={Bell}>Notification</SidebarLink>
            <SidebarLink href="/dashboard/messages" icon={Mail}>Messages</SidebarLink>
            <SidebarLink href="/dashboard/comments" icon={MessageCircle}>Comments</SidebarLink>
          </div>

          {/* Others */}
          <div className="space-y-1 mt-6">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                OTHERS
              </span>
            </div>
            <SidebarLink href="/dashboard/customers" icon={Users}>Customers</SidebarLink>
            <SidebarLink href="/dashboard/orders" icon={ClipboardList}>Orders</SidebarLink>
            <SidebarLink href="/dashboard/analytics" icon={BarChart}>Analytics</SidebarLink>
            <SidebarLink href="/dashboard/settings" icon={Settings}>Settings</SidebarLink>
          </div>
        </div>
      </div>
    </>
  );
};

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <span className="font-bold text-xl">BOTMON</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {/* Main Menu */}
          <div className="space-y-1">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                MAIN MENU
              </span>
            </div>
            <SidebarLink href="/Overview" icon={Grid} isActive={true}>Overview</SidebarLink>
            <SidebarLink href="/ProductPage" icon={ShoppingBag}>Product Page</SidebarLink>
            <SidebarLink href="/Chatbot" icon={MessageSquare}>Chat Bot</SidebarLink>
            <SidebarLink href="/Payments" icon={CreditCard}>Payment</SidebarLink>
          </div>

          {/* Social Page */}
          <div className="space-y-1 mt-6">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                SOCIAL PAGE
              </span>
            </div>
            <SidebarLink href="/Notifications" icon={Bell}>Notification</SidebarLink>
            <SidebarLink href="/Messages" icon={Mail}>Messages</SidebarLink>
           
          </div>

          {/* Others */}
          <div className="space-y-1 mt-6">
            <div className="px-4 py-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                OTHERS
              </span>
            </div>
            <SidebarLink href="/Customers" icon={Users}>Customers</SidebarLink>
            <SidebarLink href="/Orders" icon={ClipboardList}>Orders</SidebarLink>
            <SidebarLink href="/Bookings" icon={BarChart}>Bookings</SidebarLink>
            <SidebarLink href="/ManageStore" icon={Settings}>Settings</SidebarLink>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden absolute left-4 top-5 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
};

export default Sidebar;