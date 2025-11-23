import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, Activity, AlertTriangle,
  Clock, Target, MessageSquare, DollarSign,
  UserCheck, BarChart3, Zap, Package, RefreshCw
} from 'lucide-react';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    onboarding: null,
    usagePatterns: null,
    chatbotPerformance: null,
    businessMetrics: null,
    userSuccess: null,
    technicalPerformance: null,
    churnRisk: null
  });
  const [error, setError] = useState(null);

  // Color palette for charts
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Base URL for API
      const API_BASE_URL = 'https://api.automation365.io';

      const endpoints = [
        { key: 'onboarding', url: `${API_BASE_URL}/user-onboarding-engagement` },
        { key: 'usagePatterns', url: `${API_BASE_URL}/platform-usage-patterns` },
        { key: 'chatbotPerformance', url: `${API_BASE_URL}/chatbot-performance` },
        { key: 'businessMetrics', url: `${API_BASE_URL}/business-impact-metrics` },
        { key: 'userSuccess', url: `${API_BASE_URL}/user-success-indicators` },
        { key: 'technicalPerformance', url: `${API_BASE_URL}/technical-performance` },
        { key: 'churnRisk', url: `${API_BASE_URL}/churn-risk` }
      ];

      // Get auth token from localStorage if needed
      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      } : {};

      const requests = endpoints.map(endpoint => 
        axios.get(endpoint.url, config)
          .then(res => ({ key: endpoint.key, data: res.data }))
          .catch(err => ({ key: endpoint.key, data: null, error: err.message }))
      );

      const results = await Promise.all(requests);
      
      const newData = {};
      results.forEach(result => {
        newData[result.key] = result.data;
      });

      setAnalyticsData(newData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const MetricCard = ({ title, value, icon: Icon, colorClass, subtext, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
            trend > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-gray-400 text-xs mt-2">{subtext}</p>}
      </div>
    </div>
  );

  const renderOverview = () => {
    const { onboarding, businessMetrics, userSuccess, churnRisk } = analyticsData;
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Signup Completion Rate"
            value={onboarding?.signup_completion_rate ? formatPercentage(onboarding.signup_completion_rate.rate) : 'N/A'}
            icon={UserCheck}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtext={`${onboarding?.signup_completion_rate?.completed || 0} completed`}
            trend={12}
          />
          <MetricCard
            title="User Retention"
            value={userSuccess?.user_retention ? formatPercentage(userSuccess.user_retention.current_month_retention) : 'N/A'}
            icon={Users}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            subtext="30-day retention"
            trend={-5}
          />
          <MetricCard
            title="Revenue Attribution"
            value={businessMetrics?.revenue_attribution ? `$${formatNumber(businessMetrics.revenue_attribution.total_revenue)}` : 'N/A'}
            icon={DollarSign}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500"
            subtext="Total platform revenue"
            trend={23}
          />
          <MetricCard
            title="Churn Risk Users"
            value={churnRisk?.declining_usage_patterns?.users_at_risk || '0'}
            icon={AlertTriangle}
            colorClass="bg-gradient-to-r from-red-500 to-red-600"
            subtext="Users showing decline"
            trend={-8}
          />
        </div>

        {/* Quick Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={generateMockTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="users" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health Score</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={generateHealthScore()}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="metric" stroke="#6B7280" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" />
                <Radar name="Score" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderOnboarding = () => {
    const data = analyticsData.onboarding;
    if (!data) return <div className="text-center py-12 text-gray-500">No onboarding data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Onboarding & Engagement</h2>
          <p className="text-gray-600">Track how effectively new users complete signup and engage with the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Signup Completion"
            value={formatPercentage(data.signup_completion_rate?.rate)}
            icon={UserCheck}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtext={`${data.signup_completion_rate?.completed || 0} of ${data.signup_completion_rate?.total || 0} users`}
          />
          <MetricCard
            title="Time to First Value"
            value={formatDuration(data.time_to_first_value?.average_hours * 3600)}
            icon={Clock}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            subtext={`${data.time_to_first_value?.users_achieved || 0} users achieved`}
          />
          <MetricCard
            title="Activation Rate"
            value={formatPercentage(data.user_activation_rate?.activation_rate)}
            icon={Target}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500"
            subtext={`${data.user_activation_rate?.activated_users || 0} activated`}
          />
          <MetricCard
            title="Avg Session Duration"
            value={formatDuration(data.session_duration_frequency?.average_duration)}
            icon={Activity}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
            subtext={`${data.session_duration_frequency?.total_sessions || 0} sessions`}
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Funnel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={generateOnboardingFunnel(data)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Bar dataKey="users" fill="#8B5CF6">
                {generateOnboardingFunnel(data).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderUsagePatterns = () => {
    const data = analyticsData.usagePatterns;
    if (!data) return <div className="text-center py-12 text-gray-500">No usage pattern data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Usage Patterns</h2>
          <p className="text-gray-600">Understand how users navigate and interact with your platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Most Visited Pages</h4>
            <div className="space-y-3">
              {data.page_visit_frequency?.most_visited?.map((page, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{page.page}</span>
                  <span className="text-blue-600 font-semibold">{formatNumber(page.visits)} visits</span>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">User Flow Insights</h4>
            <div className="space-y-3">
              {data.user_flow_analysis?.common_paths?.map((path, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex items-center flex-wrap mb-2">
                    {path.path.map((step, stepIdx) => (
                      <React.Fragment key={stepIdx}>
                        <span className="bg-white px-3 py-1 rounded-md text-sm font-medium text-gray-700 border border-gray-200">
                          {step}
                        </span>
                        {stepIdx < path.path.length - 1 && <span className="mx-2 text-gray-400">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{path.count} users</span>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Usage Hours</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formatPeakUsageData(data.peak_usage)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="hour" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Discovery Rate</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatFeatureDiscoveryData(data.feature_discovery)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8B5CF6"
                  dataKey="value"
                  label
                >
                  {formatFeatureDiscoveryData(data.feature_discovery).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderChatbotPerformance = () => {
    const data = analyticsData.chatbotPerformance;
    if (!data) return <div className="text-center py-12 text-gray-500">No chatbot performance data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chatbot Performance Analytics</h2>
          <p className="text-gray-600">Monitor chatbot deployment, testing, and response metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Deployment Rate"
            value={formatPercentage(data.chatbot_deployment_rate?.deployment_rate)}
            icon={MessageSquare}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtext={`${data.chatbot_deployment_rate?.deployed_bots || 0} deployed bots`}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${data.response_time_improvement?.current_avg_response_time || 0}s`}
            icon={Zap}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            subtext={`${data.response_time_improvement?.improvement_percentage || 0}% improvement`}
          />
          <MetricCard
            title="Test Sessions"
            value={formatNumber(data.bot_testing?.total_test_sessions)}
            icon={Activity}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
            subtext={`${data.bot_testing?.avg_messages_per_session || 0} avg messages`}
          />
          <MetricCard
            title="Success Rate"
            value={formatPercentage(data.bot_testing?.successful_tests / data.bot_testing?.total_test_sessions)}
            icon={Target}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500"
            subtext="Test success rate"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trend</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={generateResponseTimeTrend(data)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="period" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="responseTime" stroke="#8B5CF6" name="Response Time (s)" strokeWidth={2} />
              <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name="Target" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBusinessMetrics = () => {
    const data = analyticsData.businessMetrics;
    if (!data) return <div className="text-center py-12 text-gray-500">No business metrics data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Impact Metrics</h2>
          <p className="text-gray-600">Track revenue, catalogue growth, and customer engagement metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value={`$${formatNumber(data.revenue_attribution?.total_revenue)}`}
            icon={DollarSign}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            subtext="Platform revenue"
          />
          <MetricCard
            title="Product Catalogue"
            value={formatNumber(data.product_catalogue?.total_products)}
            icon={Package}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtext={`${data.product_catalogue?.growth_rate || 0}% growth`}
          />
          <MetricCard
            title="Message Volume"
            value={formatNumber(data.message_volume_trends?.total_messages)}
            icon={MessageSquare}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
            subtext={`${data.message_volume_trends?.trend || 'stable'} trend`}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${data.response_times?.average || 0}s`}
            icon={Clock}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500"
            subtext="Customer response"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatRevenueByChannel(data.revenue_attribution)}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8B5CF6"
                  dataKey="value"
                  label
                >
                  {formatRevenueByChannel(data.revenue_attribution).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Volume Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={generateMessageVolumeTrend(data.message_volume_trends)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="messages" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderUserSuccess = () => {
    const data = analyticsData.userSuccess;
    if (!data) return <div className="text-center py-12 text-gray-500">No user success data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Success Indicators</h2>
          <p className="text-gray-600">Monitor user retention, engagement, and success metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Repeat Customers"
            value={formatPercentage(data.repeat_customer_interaction?.rate)}
            icon={Users}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            subtext={`${data.repeat_customer_interaction?.total || 0} customers`}
          />
          <MetricCard
            title="User Retention"
            value={formatPercentage(data.user_retention?.current_month_retention)}
            icon={TrendingUp}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtext="30-day retention"
          />
          <MetricCard
            title="Time Saved"
            value={`${data.time_saved_per_user?.average_hours || 0}h`}
            icon={Clock}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
            subtext="Per user average"
          />
          <MetricCard
            title="Active Segments"
            value={data.segmented_customers?.total_segments || 0}
            icon={Activity}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500"
            subtext="User segments"
          />
        </div>

        {data.segmented_customers && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.segmented_customers || {}).slice(0, 6).map(([key, value], idx) => {
                // Skip meta fields
                if (key === 'total_segments') return null;
                
                // Handle if value is an object
                let displayValue = value;
                if (typeof value === 'object' && value !== null) {
                  displayValue = value.count || value._id || value.total || '0';
                }
                
                return (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">{key.replace(/_/g, ' ')}</p>
                    <p className="text-2xl font-bold text-blue-600">{displayValue}</p>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTechnicalPerformance = () => {
    const data = analyticsData.technicalPerformance;
    if (!data) return <div className="text-center py-12 text-gray-500">No technical performance data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Performance</h2>
          <p className="text-gray-600">Monitor system performance, errors, and integration success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Page Load Time"
            value={`${data.page_load_times?.average || 0}s`}
            icon={Zap}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600"
            subtext="Average time"
          />
          <MetricCard
            title="Integration Success"
            value={formatPercentage(data.social_integration_success?.rate)}
            icon={Activity}
            colorClass="bg-gradient-to-r from-green-500 to-green-600"
            subtext="Success rate"
          />
          <MetricCard
            title="Bot Latency"
            value={`${data.bot_latency?.average || 0}ms`}
            icon={MessageSquare}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600"
            subtext="Response time"
          />
          <MetricCard
            title="Error Rate"
            value={formatPercentage(data.error_type_breakdown?.total_rate)}
            icon={AlertTriangle}
            colorClass="bg-gradient-to-r from-red-500 to-red-600"
            subtext="System errors"
          />
        </div>

        {data.error_type_breakdown && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.error_type_breakdown || {}).slice(0, 6).map(([type, value], idx) => {
                // Skip meta fields
                if (type === 'total_rate' || type === 'total_errors') return null;
                
                // Handle if value is an object
                let displayValue = value;
                if (typeof value === 'object' && value !== null) {
                  displayValue = value.count || value._id || value.total || '0';
                }
                
                return (
                  <div key={idx} className="bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">{type.replace(/_/g, ' ')}</p>
                    <p className="text-2xl font-bold text-red-600">{displayValue}</p>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        )}

        {data.messages_over_time && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Volume Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatMessagesOverTime(data.messages_over_time)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="messages" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderChurnRisk = () => {
    const data = analyticsData.churnRisk;
    if (!data) return <div className="text-center py-12 text-gray-500">No churn risk data available</div>;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Churn Risk Analysis</h2>
          <p className="text-gray-600">Identify users at risk of churning and take preventive actions</p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800 font-medium">
            {data.declining_usage_patterns?.users_at_risk || 0} users showing declining usage patterns
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Declining Usage Patterns
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg text-red-700">
                <span className="font-medium">High Risk</span>
                <span className="text-xl font-bold">{data.declining_usage_patterns?.high_risk || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg text-yellow-700">
                <span className="font-medium">Medium Risk</span>
                <span className="text-xl font-bold">{data.declining_usage_patterns?.medium_risk || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-blue-700">
                <span className="font-medium">Low Risk</span>
                <span className="text-xl font-bold">{data.declining_usage_patterns?.low_risk || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Feature Abandonment
            </h3>
            <div className="space-y-4">
              {data.feature_abandonment?.abandoned_features?.map((feature, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{feature.feature}</span>
                    <span className="text-xs font-semibold text-red-600">
                      {formatPercentage(feature.abandonment_rate)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${feature.abandonment_rate * 100}%` }}
                    />
                  </div>
                </div>
              )) || <p className="text-gray-500">No data available</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Login Frequency Drops
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Users with drops</span>
                <span className="text-lg font-bold text-gray-900">
                  {data.login_frequency_drops?.users_with_drops || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Avg drop rate</span>
                <span className="text-lg font-bold text-red-600">
                  {formatPercentage(data.login_frequency_drops?.avg_drop_rate)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Silent churned</span>
                <span className="text-lg font-bold text-orange-600">
                  {data.silent_churned_users?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatChurnRiskDistribution(data)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="risk" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Bar dataKey="users" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Helper functions for data formatting
  const generateMockTrendData = () => {
    return [
      { name: 'Jan', users: 4000 },
      { name: 'Feb', users: 4800 },
      { name: 'Mar', users: 5200 },
      { name: 'Apr', users: 6100 },
      { name: 'May', users: 7300 },
      { name: 'Jun', users: 8900 },
    ];
  };

  const generateHealthScore = () => {
    return [
      { metric: 'User Engagement', value: 85 },
      { metric: 'Performance', value: 92 },
      { metric: 'Revenue Growth', value: 78 },
      { metric: 'User Satisfaction', value: 88 },
      { metric: 'Platform Stability', value: 95 },
      { metric: 'Feature Adoption', value: 73 },
    ];
  };

  const generateOnboardingFunnel = (data) => {
    if (!data) return [];
    return [
      { stage: 'Signed Up', users: data.signup_completion_rate?.total || 0 },
      { stage: 'Completed Profile', users: data.signup_completion_rate?.completed || 0 },
      { stage: 'First Action', users: data.time_to_first_value?.users_achieved || 0 },
      { stage: 'Activated', users: data.user_activation_rate?.activated_users || 0 },
    ];
  };

  const formatPeakUsageData = (peakData) => {
    if (!peakData?.hourly_distribution) return [];
    return Object.entries(peakData.hourly_distribution).map(([hour, users]) => ({
      hour: `${hour}:00`,
      users
    }));
  };

  const formatFeatureDiscoveryData = (data) => {
    if (!data?.discovered_features) return [];
    return Object.entries(data.discovered_features).map(([feature, count]) => ({
      name: feature,
      value: count
    }));
  };

  const generateResponseTimeTrend = (data) => {
    return [
      { period: 'Week 1', responseTime: 5.2, target: 2 },
      { period: 'Week 2', responseTime: 4.5, target: 2 },
      { period: 'Week 3', responseTime: 3.8, target: 2 },
      { period: 'Week 4', responseTime: 2.9, target: 2 },
      { period: 'Current', responseTime: data?.response_time_improvement?.current_avg_response_time || 2.1, target: 2 },
    ];
  };

  const formatRevenueByChannel = (data) => {
    if (!data?.by_channel) return [];
    return Object.entries(data.by_channel).map(([channel, revenue]) => ({
      name: channel,
      value: revenue
    }));
  };

  const generateMessageVolumeTrend = (data) => {
    return [
      { date: 'Mon', messages: 1200 },
      { date: 'Tue', messages: 1400 },
      { date: 'Wed', messages: 1100 },
      { date: 'Thu', messages: 1800 },
      { date: 'Fri', messages: 2200 },
      { date: 'Sat', messages: 1900 },
      { date: 'Sun', messages: 1500 },
    ];
  };

  const formatChurnRiskDistribution = (data) => {
    return [
      { risk: 'High Risk', users: data?.declining_usage_patterns?.high_risk || 0 },
      { risk: 'Medium Risk', users: data?.declining_usage_patterns?.medium_risk || 0 },
      { risk: 'Low Risk', users: data?.declining_usage_patterns?.low_risk || 0 },
    ];
  };

  const formatMessagesOverTime = (data) => {
    if (!data) return [];
    
    // If data is an array
    if (Array.isArray(data)) {
      return data.map(item => ({
        time: item.time || item.hour || item.date || 'Unknown',
        messages: typeof item.messages === 'object' ? (item.messages.count || 0) : item.messages
      }));
    }
    
    // If data is an object with hourly/daily keys
    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => ({
        time: key,
        messages: typeof value === 'object' ? (value.count || 0) : value
      }));
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 lg:p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchAllAnalytics}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Admin Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Comprehensive insights into platform performance and user behavior
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={fetchAllAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <BarChart3 className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2">
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <BarChart3 className="w-4 h-4" />
              Overview
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'onboarding' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('onboarding')}
            >
              <UserCheck className="w-4 h-4" />
              Onboarding
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'usage' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('usage')}
            >
              <Activity className="w-4 h-4" />
              Usage Patterns
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'chatbot' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('chatbot')}
            >
              <MessageSquare className="w-4 h-4" />
              Chatbot
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'business' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('business')}
            >
              <TrendingUp className="w-4 h-4" />
              Business
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'success' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('success')}
            >
              <Users className="w-4 h-4" />
              User Success
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'technical' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('technical')}
            >
              <Zap className="w-4 h-4" />
              Technical
            </button>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'churn' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('churn')}
            >
              <AlertTriangle className="w-4 h-4" />
              Churn Risk
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'onboarding' && renderOnboarding()}
          {activeTab === 'usage' && renderUsagePatterns()}
          {activeTab === 'chatbot' && renderChatbotPerformance()}
          {activeTab === 'business' && renderBusinessMetrics()}
          {activeTab === 'success' && renderUserSuccess()}
          {activeTab === 'technical' && renderTechnicalPerformance()}
          {activeTab === 'churn' && renderChurnRisk()}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;