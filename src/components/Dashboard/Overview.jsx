import React from 'react';
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data for the chart
const chartData = [
  { name: 'Mon', revenue: 1000, days: 2000 },
  { name: 'Tue', revenue: 2000, days: 4000 },
  { name: 'Wed', revenue: 3000, days: 3000 },
  { name: 'Thu', revenue: 4000, days: 5000 },
  { name: 'Fri', revenue: 5256598, days: 6000 },
  { name: 'Sat', revenue: 7000, days: 7000 },
  { name: 'Sun', revenue: 8000, days: 8000 },
];

const StatCard = ({ title, value, trend, trendValue, icon: Icon, iconBg }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
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

const ActivityItem = ({ image, name, time }) => (
  <div className="flex items-center gap-3 py-3">
    <img src={image} alt={name} className="w-8 h-8 rounded-full" />
    <div className="flex-1">
      <h4 className="text-sm font-medium text-gray-900">{name}</h4>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

const Overview = () => {
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
                  value="1,156"
                  trend="up"
                  trendValue="+9.15%"
                  icon={TrendingUp}
                  iconBg="bg-purple-50"
                />
                <StatCard
                  title="Volume Of product sold"
                  value="1,156"
                  trend="up"
                  trendValue="+9.15%"
                  icon={Package}
                  iconBg="bg-blue-50"
                />
                <StatCard
                  title="New Customers"
                  value="1,156"
                  trend="down"
                  trendValue="-0.56%"
                  icon={Users}
                  iconBg="bg-green-50"
                />
                <StatCard
                  title="Total Visits"
                  value="239K"
                  trend="down"
                  trendValue="-1.48%"
                  icon={Eye}
                  iconBg="bg-orange-50"
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
                          <span className="text-sm text-gray-600">Vertical: Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm text-gray-600">Horizontal: Days</span>
                        </div>
                      </div>
                    </div>
                    <Select defaultValue="month">
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
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#9333EA" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="days" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Activities Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Activities</h3>
                  </div>
                  <div className="space-y-1">
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Jennifer"
                      time="Just now"
                    />
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Joe Tunde"
                      time="59 minutes ago"
                    />
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Tunji Olamide"
                      time="Today, 11:59 AM"
                    />
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Ahmad Garba"
                      time="12 hours ago"
                    />
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Esther Ademola"
                      time="12 hours ago"
                    />
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Ahmad"
                      time="12 hours ago"
                    />
                    <ActivityItem
                      image="/api/placeholder/32/32"
                      name="Olayinka"
                      time="Feb 2, 2024"
                    />
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