import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from '../Sidebar';
import DashboardHeader from '../Header';

const chartData = [
  { name: 'Mon', revenue: 1000, bookings: 2000 },
  { name: 'Tue', revenue: 2000, bookings: 4000 },
  { name: 'Wed', revenue: 3000, bookings: 3000 },
  { name: 'Thu', revenue: 4000, bookings: 5000 },
  { name: 'Fri', revenue: 5256598, bookings: 6000 },
  { name: 'Sat', revenue: 7000, bookings: 7000 },
  { name: 'Sun', revenue: 8000, bookings: 8000 },
];

const StatCard = ({ title, value, className }) => (
  <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
    <p className="text-gray-600 text-sm mb-1">{title}</p>
    <h3 className="text-2xl font-semibold">{value}</h3>
  </div>
);

const Analytics = () => {
  const [period, setPeriod] = useState('month');

  return (
    <div className="h-screen flex">
      <Sidebar />
      
      <div className="flex-1">
        <DashboardHeader title="Analytics" />

        <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-semibold">Analytics</h2>
              <div className="flex items-center gap-3">
                <Select defaultValue={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard title="Revenue" value="₦250,000" />
              <StatCard title="Amount of Bookings" value="575" />
              <StatCard title="Schedules" value="56" />
              <StatCard title="Top Location" value="Lagos, Nigeria" />
              <StatCard title="Top Services" value="Phone Swap" />
              <StatCard title="Top Customers" value="@joe11" />
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Analytics Overview</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-gray-600">Bookings</span>
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
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#6B7280' }}
                    />
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
                      dataKey="bookings" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;