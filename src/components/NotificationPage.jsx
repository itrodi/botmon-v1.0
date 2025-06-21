import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, BadgeCheck, MessageCircle, XCircle, ShoppingBag, DollarSign, Filter, Mail, MessageSquare, Phone, RefreshCw, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import Header from '../components/Header';

const NotificationPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [notificationChannels, setNotificationChannels] = useState({
    email: true,
    sms: false,
    whatsapp: false,
    call: true
  });

  // Fetch notifications on mount and set up auto-refresh
  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await fetch('https://api.automation365.io/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        toast.error(`Failed to fetch notifications (${response.status})`);
        return;
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        // Process and sort notifications by timestamp (newest first)
        const processedNotifications = result.data.map(notif => ({
          ...notif,
          timestamp: notif.timestamp || notif.created_at || new Date().toISOString()
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setNotifications(processedNotifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (!silent) {
        if (err.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          toast.error('Failed to load notifications');
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (markingAsRead[notificationId]) return;

    setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await fetch('https://api.automation365.io/mark-notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: notificationId
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.ids === notificationId 
            ? { ...notif, marked: true } 
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to mark notification as read');
      }
    } finally {
      setMarkingAsRead(prev => ({ ...prev, [notificationId]: false }));
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      'new_customer': <User className="w-4 h-4 text-purple-600" />,
      'successful_transaction': <BadgeCheck className="w-4 h-4 text-green-600" />,
      'failed_transaction': <XCircle className="w-4 h-4 text-red-600" />,
      'new_chat': <MessageCircle className="w-4 h-4 text-blue-600" />,
      'new_order': <ShoppingBag className="w-4 h-4 text-orange-600" />,
      'payment_received': <DollarSign className="w-4 h-4 text-green-600" />
    };
    return icons[type] || <Bell className="w-4 h-4 text-gray-600" />;
  };

  // Get background color for avatar based on type
  const getAvatarColor = (type) => {
    const colors = {
      'new_customer': '6d28d9',
      'successful_transaction': '22c55e',
      'failed_transaction': 'ef4444',
      'new_chat': '3b82f6',
      'new_order': 'f97316',
      'payment_received': '22c55e'
    };
    return colors[type] || '6b7280';
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();

    if (isToday(date)) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = () => {
    const grouped = {};
    
    notifications.forEach(notif => {
      const date = new Date(notif.timestamp);
      let dateKey;
      
      if (isToday(date)) {
        dateKey = 'Today';
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(notif);
    });
    
    return grouped;
  };

  // Filter notifications based on selected filter
  const filterNotifications = () => {
    let filtered = [...notifications];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(notif => {
        if (filterType === 'unread') return !notif.marked;
        if (filterType === 'read') return notif.marked;
        return notif.type === filterType;
      });
    }
    
    return filtered;
  };

  // Handle channel toggle
  const handleChannelToggle = (channel) => {
    setNotificationChannels(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
    
    // TODO: Send channel preferences to backend when endpoint is available
  };

  const filteredNotifications = filterNotifications();
  const groupedNotifications = groupNotificationsByDate();

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Notifications" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">Error loading notifications</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => fetchNotifications()} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => navigate('/login')} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Notifications" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                      Notifications
                      {notifications.filter(n => !n.marked).length > 0 && (
                        <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                          {notifications.filter(n => !n.marked).length} new
                        </span>
                      )}
                    </h2>
                    <button
                      onClick={() => fetchNotifications()}
                      disabled={isRefreshing}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">{format(date, "PPP")}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="new_customer">New Customers</option>
                      <option value="successful_transaction">Transactions</option>
                      <option value="new_chat">Chats</option>
                    </select>
                  </div>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications to display</p>
                  </div>
                ) : (
                  Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
                    <div key={dateGroup}>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{dateGroup}</h3>
                      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                        {notifs.map((notification) => (
                          <div 
                            key={notification.ids || notification._id}
                            className={`flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
                              !notification.marked ? 'bg-purple-50 hover:bg-purple-100' : ''
                            }`}
                            onClick={() => !notification.marked && markAsRead(notification.ids)}
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(notification.title || 'User')}&background=${getAvatarColor(notification.type)}&color=fff`}
                                alt={notification.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {notification.title || 'Notification'}
                                {!notification.marked && (
                                  <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                              </h3>
                              <p className="text-gray-500 text-sm truncate">
                                {notification.message || notification.description || 'No description'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500 hidden sm:block">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.marked ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                getNotificationIcon(notification.type)
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Notification Channels */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                  <h3 className="font-semibold">Notification Channels</h3>
                  <p className="text-sm text-gray-500">
                    Choose how you want to receive notifications
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <span>Email</span>
                      </div>
                      <Switch 
                        checked={notificationChannels.email}
                        onCheckedChange={() => handleChannelToggle('email')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span>SMS</span>
                      </div>
                      <Switch 
                        checked={notificationChannels.sms}
                        onCheckedChange={() => handleChannelToggle('sms')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <span>WhatsApp</span>
                      </div>
                      <Switch 
                        checked={notificationChannels.whatsapp}
                        onCheckedChange={() => handleChannelToggle('whatsapp')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-purple-600" />
                        <span>Call</span>
                      </div>
                      <Switch 
                        checked={notificationChannels.call}
                        onCheckedChange={() => handleChannelToggle('call')}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total</span>
                        <span className="font-medium">{notifications.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Unread</span>
                        <span className="font-medium text-purple-600">
                          {notifications.filter(n => !n.marked).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Today</span>
                        <span className="font-medium">
                          {notifications.filter(n => isToday(new Date(n.timestamp))).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationPage;