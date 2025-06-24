import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, Eye, Loader2 } from 'lucide-react';
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

const ActivityItem = ({ notification }) => {
  // Format the time display
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
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
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
        <span className="text-sm font-medium text-purple-600">
          {notification.customer_name?.charAt(0)?.toUpperCase() || 'N'}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900">
          {notification.customer_name || notification.title || 'New Activity'}
        </h4>
        <p className="text-xs text-gray-600 mt-0.5">
          {notification.message || notification.description || 'Activity recorded'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatTime(notification.timestamp || notification.created_at)}
        </p>
      </div>
    </div>
  );
};

const Overview = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('week');

  useEffect(() => {
    fetchAnalytics();
    fetchNotifications();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage (adjust based on your auth implementation)
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
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
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        setAnalyticsData(result.data);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://api.automation365.io/notifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        // Sort notifications by timestamp (newest first) and take only the latest 7
        const sortedNotifications = result.data
          .sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at))
          .slice(0, 7);
        setNotifications(sortedNotifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Process chart data based on the period and analytics data
  const getChartData = () => {
    if (!analyticsData || !analyticsData.daily_revenue) {
      return [];
    }

    // Assuming the backend returns daily_revenue as an object with date keys
    // Adjust this based on your actual data structure
    const dates = Object.keys(analyticsData.daily_revenue || {}).slice(-7); // Last 7 days
    
    return dates.map(date => {
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      
      return {
        name: dayName,
        revenue: analyticsData.daily_revenue[date] || 0,
        quantity: analyticsData.daily_quantity?.[date] || 0,
      };
    });
  };

  // Calculate percentage changes (you may need to adjust based on your data structure)
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { trend: 'up', value: '+0%' };
    const change = ((current - previous) / previous) * 100;
    return {
      trend: change >= 0 ? 'up' : 'down',
      value: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
    };
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    
    // For revenue, we might want to show the full number with commas
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  const chartData = getChartData();
  
  // Get stats from analytics data
  const revenue = analyticsData?.total_revenue || 0;
  const quantity = analyticsData?.total_quantity || 0;
  const customers = analyticsData?.total_customers || 0;
  const visits = analyticsData?.total_visits || 0;

  // Calculate trends (you may need previous period data from your backend)
  const revenueTrend = calculateTrend(revenue, analyticsData?.previous_revenue);
  const quantityTrend = calculateTrend(quantity, analyticsData?.previous_quantity);
  const customersTrend = calculateTrend(customers, analyticsData?.previous_customers);
  const visitsTrend = calculateTrend(visits, analyticsData?.previous_visits);

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Revenue"
                  value={`₦${formatNumber(revenue)}`}
                  trend={revenueTrend.trend}
                  trendValue={revenueTrend.value}
                  icon={TrendingUp}
                  iconBg="bg-purple-50"
                  loading={loading}
                />
                <StatCard
                  title="Volume Of product sold"
                  value={formatNumber(quantity)}
                  trend={quantityTrend.trend}
                  trendValue={quantityTrend.value}
                  icon={Package}
                  iconBg="bg-blue-50"
                  loading={loading}
                />
                <StatCard
                  title="New Customers"
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

              {/* Chart and Activities Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Analytics</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                          <span className="text-sm text-gray-600">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600">Quantity</span>
                        </div>
                      </div>
                    </div>
                    <Select value={chartPeriod} onValueChange={setChartPeriod}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
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
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip 
                            formatter={(value, name) => [
                              name === 'revenue' ? `₦${value.toLocaleString()}` : value.toLocaleString(),
                              name === 'revenue' ? 'Revenue' : 'Quantity'
                            ]}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#9333EA" 
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="quantity" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Activities Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Activities</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={fetchNotifications}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <ActivityItem 
                          key={notification.id || notification._id || index} 
                          notification={notification} 
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No recent activities</p>
                      </div>
                    )}
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

export default Overview;