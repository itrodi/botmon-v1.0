import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, BadgeCheck, MessageCircle, XCircle, ShoppingBag, DollarSign, Mail, MessageSquare, Phone, RefreshCw, Bell, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../context/SocketContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { toast } from 'react-hot-toast';
import Header from '../components/Header';

const NotificationPage = () => {
  const navigate = useNavigate();
  const { socket, connected: socketConnected, connect } = useSocket();

  const [date, setDate] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [notificationChannels, setNotificationChannels] = useState({
    email: true, sms: false, whatsapp: false, call: true
  });

  const getNotificationType = (notification) => {
    const platform = notification.platform?.toLowerCase();
    const type = notification.Type?.toLowerCase() || notification.type?.toLowerCase();
    if (type === 'product') return 'order';
    if (platform) return 'chat';
    return type || 'order';
  };

  const getNotificationTitle = (notification) => {
    const customerName = notification.name || 'Customer';
    const platform = notification.platform || '';
    const type = notification.Type || notification.type || '';
    if (type === 'Product') return `New Order from ${customerName}${platform ? ` via ${platform}` : ''}`;
    return notification.title || notification.subject || `${type} from ${customerName}`;
  };

  const getNotificationMessage = (notification) => {
    if (notification.message || notification.body || notification.description) {
      return notification.message || notification.body || notification.description;
    }
    const productName = notification.pname || 'Product';
    const quantity = notification.quantity || '1';
    const price = notification.price || '0';
    const status = notification.status || 'Pending';
    if (notification.Type === 'Product') return `Order for ${productName} (Qty: ${quantity}) - ₦${price} • Status: ${status}`;
    return 'New activity recorded';
  };

  const processNotification = (notif) => ({
    ...notif,
    timestamp: notif.timestamp || notif.created_at || new Date().toISOString(),
    id: notif.ids || notif.id || notif._id,
    marked: notif.marked || false,
    notificationType: getNotificationType(notif),
    title: getNotificationTitle(notif),
    message: getNotificationMessage(notif),
  });

  // ── Connect socket when this page mounts ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !socketConnected) {
      connect();
    }
  }, [connect, socketConnected]);

  // ── Socket listener for real-time notifications ──
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      console.log('New notification via socket:', data);
      const processed = processNotification(data);

      setNotifications((prev) => {
        const existingId = processed.id || processed.ids;
        if (existingId && prev.some(n => (n.id === existingId || n.ids === existingId))) return prev;
        return [processed, ...prev];
      });

      toast.success(processed.title || 'New notification', { duration: 4000, icon: '🔔' });
    };

    socket.on('new_notification', handleNewNotification);
    return () => { socket.off('new_notification', handleNewNotification); };
  }, [socket]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Initial fetch ──
  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setIsRefreshing(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) { toast.error('Please login first'); navigate('/login'); return; }

      const response = await fetch('https://api.automation365.io/notification-page', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.status === 401) { toast.error('Session expired.'); localStorage.removeItem('token'); navigate('/login'); return; }
      if (!response.ok) throw new Error(`Failed to fetch notifications (${response.status})`);

      const result = await response.json();
      if (result.status === 'success' && result.data) {
        setNotifications(result.data.map(processNotification).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      if (!silent) { toast.error('Failed to load notifications'); setError(err.message); }
    } finally { setLoading(false); setIsRefreshing(false); }
  };

  const markAsRead = async (notificationId) => {
    if (markingAsRead[notificationId]) return;
    setMarkingAsRead(prev => ({ ...prev, [notificationId]: true }));
    try {
      const token = localStorage.getItem('token');
      if (!token) { toast.error('Please login first'); navigate('/login'); return; }

      const response = await fetch('https://api.automation365.io/mark-notifications', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: notificationId })
      });

      if (!response.ok) {
        if (response.status === 401) { toast.error('Session expired.'); localStorage.removeItem('token'); navigate('/login'); return; }
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev => prev.map(n => (n.id === notificationId || n.ids === notificationId) ? { ...n, marked: true } : n));
      toast.success('Notification marked as read');
    } catch (err) { console.error(err); toast.error('Failed to mark notification as read'); }
    finally { setMarkingAsRead(prev => ({ ...prev, [notificationId]: false })); }
  };

  const getNotificationIcon = (notification) => {
    const type = notification.Type?.toLowerCase() || notification.type?.toLowerCase();
    const platform = notification.platform?.toLowerCase();
    if (platform === 'instagram') return <ShoppingBag className="w-4 h-4 text-pink-600" />;
    if (platform === 'whatsapp') return <MessageCircle className="w-4 h-4 text-green-600" />;
    if (platform === 'facebook' || platform === 'messenger') return <MessageCircle className="w-4 h-4 text-blue-600" />;
    const icons = {
      'product': <ShoppingBag className="w-4 h-4 text-orange-600" />, 'order': <ShoppingBag className="w-4 h-4 text-orange-600" />,
      'new_customer': <User className="w-4 h-4 text-purple-600" />, 'successful_transaction': <BadgeCheck className="w-4 h-4 text-green-600" />,
      'failed_transaction': <XCircle className="w-4 h-4 text-red-600" />, 'new_chat': <MessageCircle className="w-4 h-4 text-blue-600" />,
      'payment_received': <DollarSign className="w-4 h-4 text-green-600" />, 'customer': <User className="w-4 h-4 text-purple-600" />,
      'chat': <MessageCircle className="w-4 h-4 text-blue-600" />
    };
    return icons[type] || <Bell className="w-4 h-4 text-gray-600" />;
  };

  const getAvatarColor = (notification) => {
    const platform = notification.platform?.toLowerCase();
    const type = notification.Type?.toLowerCase() || notification.type?.toLowerCase();
    if (platform === 'instagram') return 'E4405F';
    if (platform === 'whatsapp') return '25D366';
    if (platform === 'facebook' || platform === 'messenger') return '1877F2';
    const colors = { 'product': 'f97316', 'order': 'f97316', 'new_customer': '6d28d9', 'successful_transaction': '22c55e', 'failed_transaction': 'ef4444', 'new_chat': '3b82f6', 'payment_received': '22c55e', 'customer': '6d28d9', 'chat': '3b82f6' };
    return colors[type] || '6b7280';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true });
      if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
      return format(d, 'MMM d, yyyy h:mm a');
    } catch { return 'Invalid date'; }
  };

  const filterNotifications = () => {
    if (filterType === 'all') return [...notifications];
    return notifications.filter(n => {
      if (filterType === 'unread') return !n.marked;
      if (filterType === 'read') return n.marked;
      return getNotificationType(n) === filterType;
    });
  };

  const groupNotificationsByDate = () => {
    const grouped = {};
    filterNotifications().forEach(notif => {
      try {
        const d = new Date(notif.timestamp);
        const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(notif);
      } catch {
        if (!grouped['Unknown']) grouped['Unknown'] = [];
        grouped['Unknown'].push(notif);
      }
    });
    return grouped;
  };

  const handleChannelToggle = (channel) => {
    setNotificationChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
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
                <Button onClick={() => fetchNotifications()} variant="outline">Try Again</Button>
                <Button onClick={() => navigate('/login')} className="bg-purple-600 hover:bg-purple-700 text-white">Go to Login</Button>
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
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">
                      Notifications
                      {notifications.filter(n => !n.marked).length > 0 && (
                        <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">{notifications.filter(n => !n.marked).length} new</span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-400'}`} title={socketConnected ? 'Real-time connected' : 'Reconnecting...'} />
                      <button onClick={() => fetchNotifications()} disabled={isRefreshing} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" /><span className="hidden sm:inline">{format(date, "PPP")}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="all">All</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="order">Orders</option>
                      <option value="chat">Chats</option>
                      <option value="new_customer">New Customers</option>
                      <option value="successful_transaction">Successful Transactions</option>
                      <option value="failed_transaction">Failed Transactions</option>
                      <option value="payment_received">Payments</option>
                    </select>
                  </div>
                </div>

                {filteredNotifications.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">{filterType === 'all' ? 'No notifications to display' : `No ${filterType} notifications`}</p>
                    {filterType !== 'all' && <Button variant="link" onClick={() => setFilterType('all')} className="mt-2">Show all notifications</Button>}
                  </div>
                ) : Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
                  <div key={dateGroup}>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{dateGroup}</h3>
                    <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                      {notifs.map(notification => (
                        <div key={notification.id || notification.ids || Math.random()}
                          className={`flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${!notification.marked ? 'bg-purple-50 hover:bg-purple-100' : ''}`}
                          onClick={() => !notification.marked && markAsRead(notification.id || notification.ids)}>
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getNotificationTitle(notification))}&background=${getAvatarColor(notification)}&color=fff`} alt={getNotificationTitle(notification)} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">
                              {getNotificationTitle(notification)}
                              {!notification.marked && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">New</span>}
                            </h3>
                            <p className="text-gray-500 text-sm truncate">{getNotificationMessage(notification)}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {notification.platform && (
                                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                  notification.platform.toLowerCase() === 'instagram' ? 'bg-pink-100 text-pink-700'
                                  : notification.platform.toLowerCase() === 'whatsapp' ? 'bg-green-100 text-green-700'
                                  : (notification.platform.toLowerCase() === 'facebook' || notification.platform.toLowerCase() === 'messenger') ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                                }`}>{notification.platform}</span>
                              )}
                              {notification.status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${notification.status === 'Confirmed' ? 'bg-green-100 text-green-700' : notification.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{notification.status}</span>
                              )}
                              {notification.paid && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Paid</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500 hidden sm:block">{formatTimestamp(notification.timestamp)}</span>
                            {markingAsRead[notification.id || notification.ids] ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                            ) : notification.marked ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : getNotificationIcon(notification)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                  <h3 className="font-semibold">Notification Channels</h3>
                  <p className="text-sm text-gray-500">Choose how you want to receive notifications</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mail className="w-5 h-5 text-purple-600" /><span>Email</span></div><Switch checked={notificationChannels.email} onCheckedChange={() => handleChannelToggle('email')} /></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-600" /><span>SMS</span></div><Switch checked={notificationChannels.sms} onCheckedChange={() => handleChannelToggle('sms')} /></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-600" /><span>WhatsApp</span></div><Switch checked={notificationChannels.whatsapp} onCheckedChange={() => handleChannelToggle('whatsapp')} /></div>
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Phone className="w-5 h-5 text-purple-600" /><span>Call</span></div><Switch checked={notificationChannels.call} onCheckedChange={() => handleChannelToggle('call')} /></div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-medium">{notifications.length}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Unread</span><span className="font-medium text-purple-600">{notifications.filter(n => !n.marked).length}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Today</span><span className="font-medium">{notifications.filter(n => { try { return isToday(new Date(n.timestamp)); } catch { return false; } }).length}</span></div>
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