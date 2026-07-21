import { API_BASE_URL } from '@/config/api';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, Eye, Loader2, Bell } from 'lucide-react';
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

const Overview = () => {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
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
    
    // Fetch data (ProtectedRoute ensures we have a token).
    // Note: recent activity is NOT fetched here — the /notifications route
    // belongs to the Notifications page, not this overview page.
    fetchAnalytics();
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

      const response = await fetch(API_BASE_URL + '/analytics', {
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

  const getChartData = () => {
    const revenueBreakdown = (analyticsData && analyticsData.revenue_breakdown) || [];

    // Group raw breakdown items by their YYYY-MM-DD date string.
    const groupedByDay = {};
    revenueBreakdown.forEach(item => {
      const dateStr = item.date;
      if (!dateStr) return;
      if (!groupedByDay[dateStr]) {
        groupedByDay[dateStr] = { revenue: 0, transactions: 0, day: item.day };
      }
      groupedByDay[dateStr].revenue += parseFloat(item.amount) || 0;
      groupedByDay[dateStr].transactions += 1;
    });

    const today = new Date();
    const toDateKey = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    if (chartPeriod === 'year') {
      // Last 12 months, grouped by month.
      const monthlyTotals = {};
      Object.entries(groupedByDay).forEach(([dateStr, vals]) => {
        const key = dateStr.slice(0, 7); // YYYY-MM
        if (!monthlyTotals[key]) monthlyTotals[key] = { revenue: 0, transactions: 0 };
        monthlyTotals[key].revenue += vals.revenue;
        monthlyTotals[key].transactions += vals.transactions;
      });

      const chartData = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const vals = monthlyTotals[key] || { revenue: 0, transactions: 0 };
        chartData.push({
          name: d.toLocaleDateString('en-US', { month: 'short' }),
          revenue: vals.revenue,
          quantity: vals.transactions,
          fullDate: key,
        });
      }
      return chartData;
    }

    if (chartPeriod === 'month') {
      // Current month: one point per day, from day 1 → end of month (or today).
      const chartData = [];
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const key = toDateKey(d);
        const vals = groupedByDay[key] || { revenue: 0, transactions: 0 };
        chartData.push({
          name: String(day),
          revenue: vals.revenue,
          quantity: vals.transactions,
          fullDate: key,
        });
      }
      return chartData;
    }

    // Default: last 7 days.
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const vals = groupedByDay[key];
      if (vals) {
        chartData.push({
          name: vals.day?.substring(0, 3) || d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: vals.revenue,
          quantity: vals.transactions,
          fullDate: key,
        });
      } else {
        chartData.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: 0,
          quantity: 0,
          fullDate: key,
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
                onClick={fetchAnalytics}
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
                            labelFormatter={(label) => {
                              if (chartPeriod === 'year') return `Month: ${label}`;
                              if (chartPeriod === 'month') return `Day ${label}`;
                              return `Day: ${label}`;
                            }}
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
                  </div>
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <div className="p-3 rounded-full bg-purple-50 mb-3">
                      <Bell className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Stay on top of your latest orders and messages.
                    </p>
                    <p className="text-xs text-gray-500 mt-1 mb-4">
                      Your recent activity lives on the Notifications page.
                    </p>
                    <button
                      onClick={() => navigate('/notifications')}
                      className="text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      View Notifications →
                    </button>
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
