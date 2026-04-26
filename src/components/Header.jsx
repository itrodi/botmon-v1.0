import { API_BASE_URL } from '@/config/api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, HelpCircle, LogOut, Package, Briefcase, X, Menu, Grid, ShoppingBag, MessageSquare, CreditCard, Mail, Users, ClipboardList, BarChart, PlayCircle, UserCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { logout, getUserData, getAuthHeaders } from '@/utils/authUtils';
import { useSocket } from '../context/SocketContext';

const Header = ({ title = "Botmon Dashboard" }) => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [businessData, setBusinessData] = useState({
    bname: 'Your Business',
    blogo: '/api/placeholder/40/40'
  });
  const [userName, setUserName] = useState('User');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

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

  const isLinkActive = (href) => {
    const currentPath = window.location.pathname;
    if (currentPath === href) return true;
    if (href !== '/' && currentPath.startsWith(href)) {
      const nextChar = currentPath[href.length];
      return !nextChar || nextChar === '/' || nextChar === '?';
    }
    return false;
  };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(API_BASE_URL + '/notification-page', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (!response.ok) return;
      const result = await response.json();

      if (result.status === 'success') {
        const list = Array.isArray(result?.notifications)
          ? result.notifications
          : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.notifications)
          ? result.data.notifications
          : [];
        const count = list.filter(n => !Boolean(n.marked ?? n.read ?? false)).length;
        setUnreadCount(count);
      }
    } catch (err) {
      // Silent fail
    }
  }, []);

  // ── Fetch unread notification count on mount ──
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // ── Listen for new notifications via socket — increment count ──
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };

    socket.on('new_notification', handleNewNotification);
    return () => { socket.off('new_notification', handleNewNotification); };
  }, [socket]);

  // ── Reset count when navigating to notifications page ──
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname.toLowerCase() === '/notifications') {
        // Small delay to let the page mark them
        setTimeout(() => fetchUnreadCount(), 2000);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [fetchUnreadCount]);

  // ── Sync unread count from notifications page updates ──
  useEffect(() => {
    const handleNotificationsUpdated = (event) => {
      const nextCount = event?.detail?.unreadCount;
      if (typeof nextCount === 'number') setUnreadCount(nextCount);
      else fetchUnreadCount();
    };
    window.addEventListener('notifications-updated', handleNotificationsUpdated);
    return () => window.removeEventListener('notifications-updated', handleNotificationsUpdated);
  }, [fetchUnreadCount]);

  useEffect(() => {
    fetchBusinessData();
    loadUserData();

    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  const loadUserData = () => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    if (storedUserName) setUserName(storedUserName);
    else if (storedUserEmail) setUserName(storedUserEmail.split('@')[0]);
    else if (userId) setUserName(`User ${userId.substring(0, 6)}`);

    const userBusinessData = getUserData('businessData');
    if (userBusinessData) {
      setBusinessData({
        bname: userBusinessData.bname || 'Your Business',
        blogo: userBusinessData.blogo || '/api/placeholder/40/40'
      });
    }
  };

  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(API_BASE_URL + '/auth/user-header-info', {
        headers: getAuthHeaders()
      });
      if (response.data) {
        const businessInfo = {
          bname: response.data['buisness-name'] || response.data.bname || 'Your Business',
          blogo: response.data.blogo || '/api/placeholder/40/40'
        };
        setBusinessData(businessInfo);
        const userId = localStorage.getItem('userId');
        if (userId) localStorage.setItem(`businessData_${userId}`, JSON.stringify(businessInfo));
        const displayName = response.data['buisness-name'] || response.data.bname || 'User';
        setUserName(displayName);
        if (displayName !== 'User') localStorage.setItem('userName', displayName);
      }
    } catch (error) {
      loadUserData();
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) { setSearchResults([]); setShowSearchResults(false); return; }
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Please login first'); return; }
      const headers = getAuthHeaders();

      const safeGet = async (url) => {
        try { return (await axios.get(url, { headers })).data; }
        catch { return null; }
      };

      const [rawProducts, rawServices, rawCustomers, rawOrders] = await Promise.all([
        safeGet(API_BASE_URL + '/products'),
        safeGet(API_BASE_URL + '/services'),
        safeGet(API_BASE_URL + '/customers'),
        safeGet(API_BASE_URL + '/orders'),
      ]);

      const toArray = (raw, ...keys) => {
        if (Array.isArray(raw)) return raw;
        if (!raw || typeof raw !== 'object') return [];
        for (const k of keys) { if (Array.isArray(raw[k])) return raw[k]; }
        if (Array.isArray(raw.data)) return raw.data;
        if (raw.data && typeof raw.data === 'object') {
          for (const k of keys) { if (Array.isArray(raw.data[k])) return raw.data[k]; }
        }
        return [];
      };

      const products  = toArray(rawProducts, 'products');
      const services  = toArray(rawServices, 'services');
      const customers = toArray(rawCustomers, 'customers');
      const orders    = toArray(rawOrders, 'orders');
      const q = query.toLowerCase();

      const filteredProducts = products
        .filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
        .map(p => ({ type: 'product', displayName: p.name || 'Untitled Product', id: p.id || p._id, price: p.price, image: p.image, raw: p }))
        .slice(0, 4);

      const filteredServices = services
        .filter(s => s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q))
        .map(s => ({ type: 'service', displayName: s.name || 'Untitled Service', id: s.id || s._id, price: s.price, image: s.image, raw: s }))
        .slice(0, 4);

      const filteredCustomers = customers
        .filter(c => {
          const name = (c.name || c.username || '').toLowerCase();
          const email = (c.email || '').toLowerCase();
          const phone = (c.phone || '').toLowerCase();
          return name.includes(q) || email.includes(q) || phone.includes(q);
        })
        .map(c => ({
          type: 'customer',
          displayName: c.name || c.username || 'Unknown Customer',
          id: c.instagram_id || c.id || c._id,
          subtitle: c.email || c.phone || c.platform || '',
          raw: c,
        }))
        .slice(0, 4);

      const filteredOrders = orders
        .filter(o => {
          const product = (o['product-name'] || o.product_name || o.product || o.name || '').toLowerCase();
          const email = (o.email || o.customer_email || '').toLowerCase();
          const id = (o.ids || o.id || o._id || '').toLowerCase();
          return product.includes(q) || email.includes(q) || id.includes(q);
        })
        .map(o => ({
          type: 'order',
          displayName: o['product-name'] || o.product_name || o.product || o.name || `Order ${(o.ids || o.id || o._id || '').slice(0, 8)}`,
          id: o.ids || o.id || o._id,
          subtitle: `${o.status || 'Pending'} • ₦${((parseFloat(o.price) || 0) * (parseInt(o.quantity) || 1)).toLocaleString()}`,
        }))
        .slice(0, 4);

      const combinedResults = [...filteredProducts, ...filteredServices, ...filteredCustomers, ...filteredOrders]
        .filter(item => item.id)
        .slice(0, 12);

      setSearchResults(combinedResults);
      setShowSearchResults(true);
    } catch (error) {
      if (error.response?.status === 401) { toast.error('Session expired.'); logout(); }
      else { setSearchResults([]); }
    } finally { setIsSearching(false); }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => performSearch(query), 300);
  };

  const handleSearchResultClick = (result) => {
    console.log('[Search] result clicked:', { type: result.type, id: result.id, displayName: result.displayName });
    setShowSearchResults(false);
    setSearchQuery('');
    try {
      if (result.type === 'product') {
        console.log('[Search] navigating to /product/' + result.id);
        navigate(`/product/${result.id}`, { state: { product: result.raw } });
      } else if (result.type === 'service') {
        console.log('[Search] navigating to /service/' + result.id);
        navigate(`/service/${result.id}`, { state: { service: result.raw } });
      } else if (result.type === 'customer') {
        console.log('[Search] navigating to /customer/' + result.id);
        navigate(`/customer/${result.id}`, { state: { customer: result.raw } });
      } else if (result.type === 'order') {
        console.log('[Search] navigating to /Orders');
        navigate('/Orders');
      } else {
        console.log('[Search] fallback navigate to /ProductPage');
        navigate(`/ProductPage`);
      }
    } catch (error) {
      console.error('[Search] navigation error:', error);
      toast.error('Failed to navigate');
      navigate('/Overview');
    }
  };

  const handleClearSearch = () => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) handleSearchResultClick(searchResults[0]);
    else if (searchQuery.trim()) { navigate(`/ProductPage`); setShowSearchResults(false); setSearchQuery(''); }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post(API_BASE_URL + '/auth/logout', null, { headers: getAuthHeaders() });
        } catch (e) {
          toast.error('Could not reach server — logging out locally.');
        }
      }
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout encountered an error.');
      logout();
    }
  };

  // ── Notification bell with count ──
  const NotificationBell = () => (
    <Link
      to="/Notifications"
      data-tour="header-notifications"
      className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : 'Notifications'
      }
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );

  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-full"
        aria-label="Open profile menu"
      >
        <div className="relative">
          <img src={businessData.blogo} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.target.src = '/api/placeholder/40/40'; }} />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" aria-hidden="true"></span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium">{userName}</div>
          <div className="text-xs text-gray-500">{businessData.bname}</div>
          {localStorage.getItem('userId') && <div className="text-xs text-gray-400 mt-1">ID: {localStorage.getItem('userId').substring(0, 8)}...</div>}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer"><Link to="/ManageStore" className="flex items-center gap-2 w-full"><Settings className="h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer"><Link to="/Notifications" className="flex items-center gap-2 w-full"><Bell className="h-4 w-4" /><span>Notifications</span>{unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</Link></DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer"><Link to="/SupportPage" className="flex items-center gap-2 w-full"><HelpCircle className="h-4 w-4" /><span>Support</span></Link></DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => window.dispatchEvent(new Event('tour:restart'))}><div className="flex items-center gap-2 w-full"><PlayCircle className="h-4 w-4" /><span>Take a tour</span></div></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 flex items-center gap-2" onClick={handleLogout}><LogOut className="h-4 w-4" /><span>Logout</span></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="w-full bg-white border-b border-gray-200 relative z-30">
      <div className="px-4 md:px-6 py-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-8 flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            <div className="max-w-md flex-1 relative" ref={searchResultsRef} data-tour="header-search">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                <Input type="search" placeholder="Search products, services, customers, orders..." className="pl-10 pr-10 w-full bg-gray-50 border-gray-200" value={searchQuery} onChange={handleSearchChange} onFocus={() => searchResults.length > 0 && setShowSearchResults(true)} />
                {searchQuery && <button type="button" aria-label="Clear search" onClick={handleClearSearch} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"><X className="h-4 w-4" aria-hidden="true" /></button>}
              </form>
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50" role="listbox" aria-label="Search results">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2" aria-hidden="true"></div>Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => {
                        const iconMap = { product: <Package className="h-5 w-5 text-purple-600" />, service: <Briefcase className="h-5 w-5 text-blue-600" />, customer: <UserCircle className="h-5 w-5 text-green-600" />, order: <ClipboardList className="h-5 w-5 text-orange-600" /> };
                        const subtitle = result.subtitle || (result.price ? `₦${Number(result.price).toLocaleString()}` : '');
                        return (
                          <div key={`${result.type}-${result.id}`} onClick={() => handleSearchResultClick(result)} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                            <div className="flex-shrink-0">{iconMap[result.type] || <Package className="h-5 w-5 text-gray-400" />}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.displayName}</p>
                              <p className="text-xs text-gray-500 capitalize">{result.type}{subtitle ? ` • ${subtitle}` : ''}</p>
                            </div>
                            {result.image && <img src={result.image} alt={result.displayName} className="w-10 h-10 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />}
                          </div>
                        );
                      })}
                    </>
                  ) : searchQuery ? (
                    <div className="p-4 text-center text-gray-500"><p>No results found for "{searchQuery}"</p></div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-gray-600">{getCurrentDate()}</span>
            <NotificationBell />
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right"><div className="text-sm font-medium text-gray-900">{userName}</div><div className="text-xs text-gray-500">{businessData.bname}</div></div>
              <ProfileDropdown />
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{title}</h1>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <ProfileDropdown />
            </div>
          </div>
          <div className="relative" ref={searchResultsRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
              <Input type="search" placeholder="Search..." className="pl-10 pr-10 w-full bg-gray-50 border-gray-200" value={searchQuery} onChange={handleSearchChange} onFocus={() => searchResults.length > 0 && setShowSearchResults(true)} />
              {searchQuery && <button type="button" aria-label="Clear search" onClick={handleClearSearch} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"><X className="h-4 w-4" aria-hidden="true" /></button>}
            </form>
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>Searching...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((result) => {
                      const mobileIconMap = { product: <Package className="h-4 w-4 text-purple-600" />, service: <Briefcase className="h-4 w-4 text-blue-600" />, customer: <UserCircle className="h-4 w-4 text-green-600" />, order: <ClipboardList className="h-4 w-4 text-orange-600" /> };
                      const subtitle = result.subtitle || (result.price ? `₦${Number(result.price).toLocaleString()}` : '');
                      return (
                        <div key={`mobile-${result.type}-${result.id}`} onClick={() => handleSearchResultClick(result)} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                          <div className="flex-shrink-0">{mobileIconMap[result.type] || <Package className="h-4 w-4 text-gray-400" />}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{result.displayName}</p>
                            <p className="text-xs text-gray-500 capitalize">{result.type}{subtitle ? ` • ${subtitle}` : ''}</p>
                          </div>
                          {result.image && <img src={result.image} alt={result.displayName} className="w-8 h-8 rounded object-cover" onError={(e) => { e.target.style.display = 'none'; }} />}
                        </div>
                      );
                    })}
                    {searchQuery && <div onClick={() => { navigate(`/ProductPage`); setShowSearchResults(false); setSearchQuery(''); }} className="p-3 text-center text-purple-600 hover:bg-purple-50 cursor-pointer border-t border-gray-100">View all results for "{searchQuery}"</div>}
                  </>
                ) : searchQuery ? <div className="p-4 text-center text-gray-500">No results found</div> : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <img src="/Images/botmon-logo.png" alt="Logo" className="h-8" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close menu"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {Object.entries(navigationStructure).map(([key, items]) => (
                <div key={key} className={key !== 'mainMenu' ? 'mt-6' : ''}>
                  <div className="px-4 py-2"><span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{key === 'mainMenu' ? 'MAIN MENU' : key === 'socialPage' ? 'SOCIAL PAGE' : 'OTHERS'}</span></div>
                  {items.map((item) => (
                    <Link key={item.href} to={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors mx-2 ${isLinkActive(item.href) ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-purple-600 hover:bg-purple-50'}`}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.href === '/Notifications' && unreadCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount > 99 ? '99+' : unreadCount}</span>}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </>
      )}
    </header>
  );
};

export default Header;
