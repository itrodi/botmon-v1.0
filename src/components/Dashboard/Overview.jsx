import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, Eye, Loader2, ShoppingBag, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StatCard = ({ title, value, trend, trendValue, icon: Icon, iconBg, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        {loading ? (
          <div className="flex items-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <h3 className="text-2xl font-semibold">{value}</h3>
        )}
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className="w-6 h-6 text-purple-600" />
      </div>
    </div>
    <div className="mt-4 flex items-center">
      {trend === 'up' ? (
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
      )}
      <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
        {trendValue}
      </span>
    </div>
  </div>
);

const normalizeImageUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('data:')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `https://${value}`;
};

const getObjectIdTimestamp = (value) => {
  if (typeof value !== 'string' || value.length < 8) return null;
  const ts = parseInt(value.slice(0, 8), 16);
  if (Number.isNaN(ts)) return null;
  return new Date(ts * 1000).toISOString();
};

const getActivityTitle = (notif) => {
  if (notif.title || notif.subject) return notif.title || notif.subject;
  const customerName = notif.username || notif.name || 'Customer';
  return customerName;
};

const getActivityMessage = (notif) => {
  if (notif.message || notif.body || notif.description) return notif.message || notif.body || notif.description;
  const productName = notif.pname || 'Product';
  const quantity = notif.quantity || '1';
  const price = notif.price || '0';
  const status = notif.status || 'Pending';
  if (notif.Type === 'Product') {
    const formattedPrice = typeof price === 'string' && (price.includes('$') || price.includes('₦')) ? price : `₦${price}`;
    return `Order for ${productName} (Qty: ${quantity}) - ${formattedPrice} • Status: ${status}`;
  }
  return 'New activity recorded';
};

const getPlatformBadgeClass = (platform) => {
  switch (platform?.toLowerCase()) {
    case 'instagram':
      return 'bg-pink-100 text-pink-700';
    case 'whatsapp':
      return 'bg-green-100 text-green-700';
    case 'facebook':
    case 'messenger':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Unknown time';
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Invalid date';
  }
};

const getActivityAvatar = (notif) => {
  const direct =
    notif.profile_image ||
    notif['profile-image'] ||
    notif.profileImage ||
    notif.profile_picture ||
    notif.avatar ||
    notif.image;
  const normalized = normalizeImageUrl(direct);
  if (normalized) return normalized;
  const name = notif.username || notif.name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6B7280&color=fff`;
};

const ActivityItem = ({ notification, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-3 py-3 border-b last:border-b-0 hover:bg-gray-50 rounded-lg px-2"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={getActivityAvatar(notification)}
          alt=""
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const fallbackName = notification.username || notification.name || 'User';
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=6B7280&color=fff`;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">
          {getActivityTitle(notification)}
        </h4>
        <p className="text-xs text-gray-600 mt-0.5 truncate">
          {getActivityMessage(notification)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">
            {formatRelativeTime(notification.timestamp)}
          </p>
          {notification.platform && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformBadgeClass(notification.platform)}`}>
              {notification.platform}
            </span>
          )}
          {notification.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              notification.status === 'Confirmed' 
                ? 'bg-green-100 text-green-700' 
                : notification.status === 'Rejected'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {notification.status}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const Overview = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('week');
  
  const toastShown = useRef(false);

  // Show OAuth toast and fetch data on mount
  useEffect(() => {
    // Show OAuth success/error toast only once
    if (!toastShown.current) {
      toastShown.current = true;
      
      const oauthSuccess = sessionStorage.getItem('oauth_success');
      if (oauthSuccess) {
        sessionStorage.removeItem('oauth_success');
        toast.success('Login successful!');
      }
      
      const oauthError = sessionStorage.getItem('oauth_error');
      if (oauthError) {
        sessionStorage.removeItem('oauth_error');
        toast.error(oauthError);
      }
    }
    
    // Fetch data (ProtectedRoute ensures we have a token)
    fetchAnalytics();
    fetchNotifications();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://api.automation365.io/analytics', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch analytics data (${response.status})`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setAnalyticsData(result.data);
      } else {
        throw new Error('Invalid analytics data format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
      if (!err.message.includes('401') && !err.message.includes('login')) {
        toast.error('Failed to load analytics data');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await fetch('https://api.automation365.io/notifications?limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      const list = Array.isArray(result?.notifications)
        ? result.notifications
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.notifications)
        ? result.data.notifications
        : [];

      if (result.status === 'success') {
        const processed = list.map((notif) => ({
          ...notif,
          timestamp:
            notif.timestamp ||
            notif.created_at ||
            notif.time ||
            notif.date ||
            getObjectIdTimestamp(notif._id || notif.id) ||
            new Date().toISOString(),
          id: notif._id || notif.ids || notif.id,
          title: getActivityTitle(notif),
          message: getActivityMessage(notif),
        }));
        const sortedNotifications = processed
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 7);
        setNotifications(sortedNotifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const getNotificationAction = (notification) => {
    const action = notification.action || {};
    if (action.type) return { type: action.type, ...action };
    const type = (notification.Type || notification.type || '').toLowerCase();
    if (type.includes('service') || type.includes('booking') || type.includes('appointment')) {
      return { type: 'booking' };
    }
    if (type === 'product' || notification.pname || notification.price) {
      return { type: 'order' };
    }
    if (notification.username || notification.platform) {
      return { type: 'chat' };
    }
    return { type: 'none' };
  };

  const handleActivityClick = (notification) => {
    const action = getNotificationAction(notification);

    if (action.type === 'chat') {
      const username = action.username || notification.username || notification.name;
      const conversationId = action.conversation_id || action.conversationId || notification.conversation_id || notification.chat_id || null;
      if (username || conversationId) {
        navigate('/Messages', { state: { username, conversationId } });
        return;
      }
    }

    if (action.type === 'order') {
      const orderId = action.order_id || action.orderId || notification.ids || notification.id || notification._id;
      if (orderId) {
        navigate('/Orders', { state: { orderId } });
        return;
      }
    }

    if (action.type === 'booking') {
      const bookingId = action.booking_id || action.bookingId || notification.ids || notification.id || notification._id;
      const search = notification['service-name'] || notification.service_name || notification.serviceName || null;
      if (bookingId || search) {
        navigate('/Bookings', { state: { bookingId, search } });
        return;
      }
    }

    navigate('/notifications');
  };

  const getChartData = () => {
    if (!analyticsData || !analyticsData.revenue_breakdown) {
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          quantity: 0,
        });
      }
      return mockData;
    }

    const revenueBreakdown = analyticsData.revenue_breakdown || [];
    
    const groupedData = {};
    revenueBreakdown.forEach(item => {
      const date = item.date;
      if (!groupedData[date]) {
        groupedData[date] = {
          revenue: 0,
          transactions: 0,
          day: item.day
        };
      }
      groupedData[date].revenue += parseFloat(item.amount) || 0;
      groupedData[date].transactions += 1;
    });
    
    if (Object.keys(groupedData).length === 0) {
      const mockData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          quantity: 0,
        });
      }
      return mockData;
    }
    
    const chartData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (groupedData[dateStr]) {
        const data = groupedData[dateStr];
        chartData.push({
          name: data.day?.substring(0, 3) || date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: data.revenue,
          quantity: data.transactions,
          fullDate: dateStr
        });
      } else {
        chartData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          quantity: 0,
          fullDate: dateStr
        });
      }
    }
    
    return chartData;
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toLocaleString();
  };

  const chartData = getChartData();
  
  const revenue = parseFloat(analyticsData?.total_revenue) || 0;
  const quantity = parseInt(analyticsData?.total_quantity) || 0;
  const customers = parseInt(analyticsData?.customers) || 0;
  const visits = parseInt(analyticsData?.visits) || 0;

  const calculateTrendFromChart = (currentValue, chartDataKey) => {
    if (chartData.length < 2) {
      return { trend: 'up', value: '+0%' };
    }
    
    const lastValue = chartData[chartData.length - 1]?.[chartDataKey] || 0;
    const previousValue = chartData[chartData.length - 2]?.[chartDataKey] || 0;
    
    if (previousValue === 0) {
      return { trend: lastValue > 0 ? 'up' : 'down', value: lastValue > 0 ? '+100%' : '0%' };
    }
    
    const change = ((lastValue - previousValue) / previousValue) * 100;
    return {
      trend: change >= 0 ? 'up' : 'down',
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    };
  };

  const revenueTrend = calculateTrendFromChart(revenue, 'revenue');
  const quantityTrend = calculateTrendFromChart(quantity, 'quantity');
  const customersTrend = { trend: 'up', value: '+12%' };
  const visitsTrend = { trend: 'up', value: '+8%' };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Overview" />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => {
                  fetchAnalytics();
                  fetchNotifications();
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader title="Overview" />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Revenue"
                  value={`₦${formatNumber(revenue)}`}
                  trend={revenueTrend.trend}
                  trendValue={revenueTrend.value}
                  icon={TrendingUp}
                  iconBg="bg-purple-50"
                  loading={loading}
                />
                <StatCard
                  title="Products Sold"
                  value={formatNumber(quantity)}
                  trend={quantityTrend.trend}
                  trendValue={quantityTrend.value}
                  icon={Package}
                  iconBg="bg-blue-50"
                  loading={loading}
                />
                <StatCard
                  title="Total Customers"
                  value={formatNumber(customers)}
                  trend={customersTrend.trend}
                  trendValue={customersTrend.value}
                  icon={Users}
                  iconBg="bg-green-50"
                  loading={loading}
                />
                <StatCard
                  title="Total Visits"
                  value={formatNumber(visits)}
                  trend={visitsTrend.trend}
                  trendValue={visitsTrend.value}
                  icon={Eye}
                  iconBg="bg-orange-50"
                  loading={loading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Revenue & Sales Analytics</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                          <span className="text-sm text-gray-600">Revenue (₦)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600">Transactions</span>
                        </div>
                      </div>
                    </div>
                    <Select value={chartPeriod} onValueChange={setChartPeriod}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Last 7 Days</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="h-[300px]">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false}
                            fontSize={12}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false}
                            fontSize={12}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'revenue' ? `₦${parseFloat(value).toLocaleString()}` : `${parseInt(value).toLocaleString()} transactions`,
                              name === 'revenue' ? 'Revenue' : 'Transactions'
                            ]}
                            labelFormatter={(label) => `Day: ${label}`}
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#9333EA" 
                            strokeWidth={3}
                            dot={{ fill: '#9333EA', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#9333EA' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="quantity" 
                            stroke="#3B82F6" 
                            strokeWidth={3}
                            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#3B82F6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  {chartData.length === 0 && !loading && (
                    <div className="text-center text-gray-500 mt-4">
                      <p className="text-sm">No data available for the selected period</p>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Recent Activities</h3>
                    <button 
                      onClick={fetchNotifications}
                      disabled={notificationsLoading}
                      className="text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
                    >
                      {notificationsLoading ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>
                  <div className="space-y-1 max-h-[350px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <ActivityItem 
                          key={notification.ids || notification.id || index} 
                          notification={notification}
                          onClick={() => handleActivityClick(notification)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm">No recent activities</p>
                        <p className="text-xs mt-1">Activities will appear here when customers interact with your store</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <button 
                        onClick={() => navigate('/notifications')}
                        className="w-full text-sm text-purple-600 hover:text-purple-700 py-2"
                      >
                        View All Activities →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Overview;
