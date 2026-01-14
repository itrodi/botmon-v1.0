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
  UserCheck, BarChart3, Zap, RefreshCw,
  Database, Trash2, Shield, X, CheckCircle, XCircle
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

  // Database management states
  const [excludeEmails, setExcludeEmails] = useState('');
  const [deleteEmails, setDeleteEmails] = useState('');
  const [dbActionLoading, setDbActionLoading] = useState(false);
  const [dbActionResult, setDbActionResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  // ==================== HELPER FUNCTIONS ====================

  const extractData = (response) => {
    if (response === null || response === undefined) return null;
    if (Array.isArray(response) && response.length === 2) {
      const [data, possibleStatus] = response;
      if (typeof possibleStatus === 'number') return data;
    }
    return response;
  };

  const getDataArray = (extracted) => {
    if (!extracted) return [];
    if (extracted.data && Array.isArray(extracted.data)) return extracted.data;
    if (Array.isArray(extracted)) return extracted;
    return [];
  };

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

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

      console.log('Fetched Analytics Data:', newData);
      setAnalyticsData(newData);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const parsePercentageString = (str) => {
    if (!str || typeof str !== 'string') return null;
    const match = str.match(/([\d.]+)%?/);
    return match ? parseFloat(match[1]) / 100 : null;
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string' && value.includes('%')) return value;
    if (typeof value === 'number') {
      return value <= 1 ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`;
    }
    return 'N/A';
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatMinutesToDuration = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  // ==================== DATABASE MANAGEMENT FUNCTIONS ====================

  const parseEmailList = (emailString) => {
    if (!emailString.trim()) return [];
    return emailString
      .split(/[,\n]/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email && email.includes('@'));
  };

  const handleDeleteDatabase = async () => {
    setDbActionLoading(true);
    setDbActionResult(null);
    
    try {
      const API_BASE_URL = 'https://api.automation365.io';
      const token = localStorage.getItem('token');
      const emailsToKeep = parseEmailList(excludeEmails);
      
      const response = await axios.post(
        `${API_BASE_URL}/delete-database`,
        { emails: emailsToKeep },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setDbActionResult({ success: true, type: 'database', data: response.data });
      setExcludeEmails('');
    } catch (err) {
      setDbActionResult({ success: false, type: 'database', error: err.response?.data?.error || err.message });
    } finally {
      setDbActionLoading(false);
      setShowConfirmModal(false);
      setConfirmText('');
    }
  };

  const handleDeleteSpecificUsers = async () => {
    setDbActionLoading(true);
    setDbActionResult(null);
    
    try {
      const API_BASE_URL = 'https://api.automation365.io';
      const token = localStorage.getItem('token');
      const emailsToDelete = parseEmailList(deleteEmails);
      
      if (emailsToDelete.length === 0) {
        setDbActionResult({ success: false, type: 'specific', error: 'No valid email addresses provided' });
        setDbActionLoading(false);
        setShowConfirmModal(false);
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/delete-specific-user`,
        { emails: emailsToDelete },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      
      setDbActionResult({ success: true, type: 'specific', data: response.data });
      setDeleteEmails('');
    } catch (err) {
      setDbActionResult({ success: false, type: 'specific', error: err.response?.data?.error || err.message });
    } finally {
      setDbActionLoading(false);
      setShowConfirmModal(false);
      setConfirmText('');
    }
  };

  const openConfirmModal = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
    setConfirmText('');
  };

  const executeConfirmedAction = () => {
    if (confirmAction === 'database') handleDeleteDatabase();
    else if (confirmAction === 'specific') handleDeleteSpecificUsers();
  };

  // ==================== METRIC CARD COMPONENT ====================

  const MetricCard = ({ title, value, icon: Icon, colorClass, subtext, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
            trend > 0 ? 'text-green-600 bg-green-100' : trend < 0 ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
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

  // ==================== CONFIRMATION MODAL ====================

  const ConfirmationModal = () => {
    if (!showConfirmModal) return null;

    const isDatabase = confirmAction === 'database';
    const requiredText = isDatabase ? 'DELETE DATABASE' : 'DELETE USERS';
    const isConfirmValid = confirmText === requiredText;
    const emailsToKeep = parseEmailList(excludeEmails);
    const emailsToDelete = parseEmailList(deleteEmails);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {isDatabase ? 'Delete Entire Database' : 'Delete Specific Users'}
              </h3>
            </div>
            <button onClick={() => setShowConfirmModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium mb-2">⚠️ This action is irreversible!</p>
            {isDatabase ? (
              <div className="text-sm text-red-700">
                <p>You are about to delete the entire database.</p>
                {emailsToKeep.length > 0 ? (
                  <p className="mt-2"><strong>Accounts to KEEP:</strong> {emailsToKeep.join(', ')}</p>
                ) : (
                  <p className="mt-2 font-semibold">⚠️ No accounts specified to keep - ALL DATA WILL BE DELETED!</p>
                )}
              </div>
            ) : (
              <div className="text-sm text-red-700">
                <p>You are about to permanently delete these accounts:</p>
                <p className="mt-2 font-medium">{emailsToDelete.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono bg-gray-100 px-2 py-1 rounded">{requiredText}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-mono"
              placeholder={requiredText}
            />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
              Cancel
            </button>
            <button
              onClick={executeConfirmedAction}
              disabled={!isConfirmValid || dbActionLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                isConfirmValid && !dbActionLoading ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {dbActionLoading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Processing...</>
              ) : (
                <><Trash2 className="w-5 h-5" />Confirm Delete</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== DATABASE MANAGEMENT TAB ====================

  const renderDatabaseManagement = () => {
    const emailsToKeep = parseEmailList(excludeEmails);
    const emailsToDelete = parseEmailList(deleteEmails);

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Management</h2>
          <p className="text-gray-600">Manage database cleanup and user deletion. Use with extreme caution.</p>
        </div>

        {dbActionResult && (
          <div className={`rounded-xl p-6 shadow-lg ${dbActionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-4">
              {dbActionResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold ${dbActionResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  {dbActionResult.success ? 'Operation Successful' : 'Operation Failed'}
                </h3>
                {dbActionResult.success ? (
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Mode:</strong> {dbActionResult.data.mode}</p>
                    <p><strong>Total Deleted:</strong> {dbActionResult.data.total_deleted} documents</p>
                    {dbActionResult.data.details && Object.keys(dbActionResult.data.details).length > 0 && (
                      <div className="mt-2">
                        <strong>Details by Collection:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {Object.entries(dbActionResult.data.details).map(([collection, count]) => (
                            <li key={collection}>{collection}: {count}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-red-700">{dbActionResult.error}</p>
                )}
              </div>
              <button onClick={() => setDbActionResult(null)} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delete Entire Database */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Entire Database</h3>
                  <p className="text-red-100 text-sm">Wipe all data except specified accounts</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Danger Zone</p>
                    <p>This will delete ALL data in the database.</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emails to KEEP</label>
                <textarea
                  value={excludeEmails}
                  onChange={(e) => setExcludeEmails(e.target.value)}
                  placeholder="Enter emails separated by commas or new lines..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[120px] resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {emailsToKeep.length > 0 ? `${emailsToKeep.length} valid email(s) will be preserved` : 'No emails specified - ALL data will be deleted'}
                </p>
              </div>

              {emailsToKeep.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {emailsToKeep.map((email, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                      <Shield className="w-3 h-3" />{email}
                    </span>
                  ))}
                </div>
              )}

              <button onClick={() => openConfirmModal('database')} className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />Delete Database
              </button>
            </div>
          </div>

          {/* Delete Specific Users */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Delete Specific Users</h3>
                  <p className="text-orange-100 text-sm">Remove individual accounts by email</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Targeted Deletion</p>
                    <p>Only the specified accounts will be deleted.</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Emails to DELETE</label>
                <textarea
                  value={deleteEmails}
                  onChange={(e) => setDeleteEmails(e.target.value)}
                  placeholder="Enter emails separated by commas or new lines..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[120px] resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {emailsToDelete.length > 0 ? `${emailsToDelete.length} account(s) will be deleted` : 'Enter at least one email address'}
                </p>
              </div>

              {emailsToDelete.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {emailsToDelete.map((email, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />{email}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => openConfirmModal('specific')}
                disabled={emailsToDelete.length === 0}
                className={`w-full px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  emailsToDelete.length > 0 ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-5 h-5" />Delete Selected Users
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Confirmation Required</span>
              </div>
              <p className="text-sm text-gray-600">All delete operations require typing a confirmation phrase.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Collections Affected</span>
              </div>
              <p className="text-sm text-gray-600">Deletes affect user data, sessions, bot data, orders, and chat messages.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">Irreversible</span>
              </div>
              <p className="text-sm text-gray-600">Deleted data cannot be recovered. Ensure you have backups.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  // ==================== OVERVIEW ====================

  const renderOverview = () => {
    const { onboarding, businessMetrics, userSuccess, churnRisk } = analyticsData;
    
    const signupData = onboarding?.signup_completion_rate || {};
    const signupRate = signupData.signup_completion_rate || 'N/A';
    const signupCompleted = signupData.completed || 0;
    
    const retentionExtracted = extractData(userSuccess?.user_retention);
    const retentionArray = getDataArray(retentionExtracted);
    let retentionRate = 'N/A';
    if (retentionArray.length > 0) {
      const avgRetention = retentionArray.reduce((sum, u) => sum + (u.retention_rate_percent || 0), 0) / retentionArray.length;
      retentionRate = `${avgRetention.toFixed(1)}%`;
    }
    
    const revenueExtracted = extractData(businessMetrics?.revenue_attribution);
    const revenueData = revenueExtracted?.data || revenueExtracted || {};
    const totalRevenue = revenueData.total_revenue || 0;
    
    const churnExtracted = extractData(churnRisk?.declining_usage_patterns);
    const usersAtRisk = churnExtracted?.declining_users_count || 0;
    
    const cohortExtracted = extractData(onboarding?.cohort_analysis);
    const cohortArray = getDataArray(cohortExtracted);
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Signup Completion Rate" value={signupRate} icon={UserCheck}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600" subtext={`${signupCompleted} completed`} />
          <MetricCard title="User Retention" value={retentionRate} icon={Users}
            colorClass="bg-gradient-to-r from-green-500 to-green-600" subtext="30-day retention" />
          <MetricCard title="Revenue Attribution" value={`$${formatNumber(totalRevenue)}`} icon={DollarSign}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500" subtext="Total platform revenue" />
          <MetricCard title="Churn Risk Users" value={usersAtRisk} icon={AlertTriangle}
            colorClass="bg-gradient-to-r from-red-500 to-red-600" subtext="Users showing decline" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
            {cohortArray.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cohortArray.map(c => ({ name: c.cohort_month || c.month || 'Unknown', users: c.total_users || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="users" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">No cohort data available</div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health Score</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={generateHealthScore(analyticsData)}>
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

  // ==================== ONBOARDING ====================

  const renderOnboarding = () => {
    const data = analyticsData.onboarding;
    if (!data) return <div className="text-center py-12 text-gray-500">No onboarding data available</div>;

    const signupData = data.signup_completion_rate || {};
    const signupRateStr = signupData.signup_completion_rate || '0%';
    const signupCompleted = signupData.completed || 0;
    const signupStarted = signupData.started || 0;
    
    const ttfvData = data.time_to_first_value || {};
    const ttfvMinutes = ttfvData.average_ttfv_minutes || 0;
    const ttfvUsers = ttfvData.users?.length || ttfvData.user_count || 0;
    
    const activationData = data.user_activation_rate || {};
    const activationRate = activationData.activation_rate || 0;
    const activatedUsers = activationData.activated_users || 0;
    
    const sessionData = data.session_duration_frequency || {};
    const avgSessionMinutes = sessionData.global_average_minutes || 0;
    const sessionUsers = sessionData.users || [];
    const totalSessions = sessionUsers.reduce((sum, u) => sum + (u.total_sessions || 0), 0);

    const cohortExtracted = extractData(data.cohort_analysis);
    const cohortArray = getDataArray(cohortExtracted);

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Onboarding & Engagement</h2>
          <p className="text-gray-600">Track how effectively new users complete signup and engage with the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Signup Completion" value={signupRateStr} icon={UserCheck}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600" subtext={`${signupCompleted} of ${signupStarted} users`} />
          <MetricCard title="Time to First Value" value={ttfvMinutes > 0 ? formatMinutesToDuration(ttfvMinutes) : 'N/A'} icon={Clock}
            colorClass="bg-gradient-to-r from-green-500 to-green-600" subtext={`${ttfvUsers} users achieved`} />
          <MetricCard title="Activation Rate" value={formatPercentage(activationRate / 100)} icon={Target}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500" subtext={`${activatedUsers} activated`} />
          <MetricCard title="Avg Session Duration" value={formatMinutesToDuration(avgSessionMinutes)} icon={Activity}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600" subtext={`${totalSessions} total sessions`} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Funnel</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[
              { stage: 'Started Signup', users: signupStarted },
              { stage: 'Completed Signup', users: signupCompleted },
              { stage: 'First Value', users: ttfvUsers || Math.round(signupCompleted * 0.7) },
              { stage: 'Activated', users: activatedUsers },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
              <Bar dataKey="users" fill="#8B5CF6">
                {[0, 1, 2, 3].map((index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {cohortArray.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cohort</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Users</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cohortArray.map((cohort, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{cohort.cohort_month || cohort.month}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cohort.total_users}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{cohort.active_users}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          cohort.retention_rate_percent >= 80 ? 'bg-green-100 text-green-800' :
                          cohort.retention_rate_percent >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>{cohort.retention_rate_percent?.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activationData.churn_breakdown && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activation Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Signup Only</p>
                <p className="text-2xl font-bold text-red-600">{activationData.churn_breakdown.signup_only || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Deployed Only</p>
                <p className="text-2xl font-bold text-yellow-600">{activationData.churn_breakdown.deployed_only || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Fully Activated</p>
                <p className="text-2xl font-bold text-green-600">{activationData.churn_breakdown.full_activated || 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== USAGE PATTERNS ====================

  const renderUsagePatterns = () => {
    const data = analyticsData.usagePatterns;
    if (!data) return <div className="text-center py-12 text-gray-500">No usage pattern data available</div>;

    const pageVisitData = data.page_visit_frequency || {};
    const pageVisits = pageVisitData.page_visit_analytics || [];
    
    const userFlowData = data.user_flow_analysis || {};
    const userFlows = userFlowData.top_user_flows || [];
    
    const featureDiscoveryExtracted = extractData(data.feature_discovery);
    const featureDiscovery = getDataArray(featureDiscoveryExtracted);
    
    const peakUsage = data.peak_usage || [];
    const featureDepth = data.feature_discovery_depth || {};

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Usage Patterns</h2>
          <p className="text-gray-600">Understand how users navigate and interact with your platform</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Most Visited Pages</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pageVisits.length > 0 ? (
                pageVisits.sort((a, b) => b.total_visits - a.total_visits).slice(0, 10).map((page, idx) => (
                  <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="text-gray-700 font-medium">{page.page}</span>
                      <p className="text-xs text-gray-400">{page.total_users} users • {page.avg_duration_seconds?.toFixed(1)}s avg</p>
                    </div>
                    <span className="text-blue-600 font-semibold">{formatNumber(page.total_visits)} visits</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No page visit data available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">User Flow Insights</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {userFlows.length > 0 ? (
                userFlows.map((flow, idx) => {
                  const steps = typeof flow.path === 'string' ? flow.path.split(' → ').slice(0, 5) : (flow.path || []).slice(0, 5);
                  return (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-500">
                      <div className="flex items-center flex-wrap mb-2">
                        {steps.map((step, stepIdx) => (
                          <React.Fragment key={stepIdx}>
                            <span className="bg-white px-2 py-1 rounded-md text-xs font-medium text-gray-700 border border-gray-200 mb-1">{step}</span>
                            {stepIdx < steps.length - 1 && <span className="mx-1 text-gray-400 text-xs">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{flow.count} users</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500">No user flow data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Usage Hours</h3>
            {peakUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formatPeakUsageData(peakUsage)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="hour" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Bar dataKey="sessions" fill="#10B981" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">No peak usage data available</div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Discovery</h3>
            {featureDiscovery.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={featureDiscovery.map(item => ({ name: item.feature || item.name, value: item.count || item.value || 0 }))}
                    cx="50%" cy="50%" outerRadius={100} fill="#8B5CF6" dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {featureDiscovery.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">No feature discovery data available</div>
            )}
          </div>
        </div>

        {featureDepth.data && Object.keys(featureDepth.data).length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage Depth</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(featureDepth.data).map(([feature, stats], idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{feature}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Discoveries:</span><span className="font-medium">{stats.total_discoveries || 0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Interactions:</span><span className="font-medium">{stats.total_interactions || 0}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Unique Users:</span><span className="font-medium">{stats.unique_users || 0}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // ==================== CHATBOT PERFORMANCE ====================

  const renderChatbotPerformance = () => {
    const data = analyticsData.chatbotPerformance;
    if (!data) return <div className="text-center py-12 text-gray-500">No chatbot performance data available</div>;

    const deploymentData = data.chatbot_deployment_rate || {};
    const deploymentRate = deploymentData.success_rate_percent || 0;
    const deployedBots = deploymentData.success_count || 0;
    const totalAttempts = deploymentData.total_attempts || 0;
    const failureReasons = deploymentData.common_failure_reasons || [];
    
    const botTestingExtracted = extractData(data.bot_testing);
    const botTestingData = botTestingExtracted || {};
    const overallTesting = botTestingData.overall || {};
    const totalTests = overallTesting.total_tests || 0;
    const successfulTests = overallTesting.total_success || 0;
    const testSuccessRate = overallTesting.success_rate || 0;
    
    const responseTimeExtracted = extractData(data.response_time_improvement);
    const responseTimeData = responseTimeExtracted || {};
    const beforeAvg = responseTimeData.before_avg_seconds || 0;
    const afterAvg = responseTimeData.after_avg_seconds || 0;
    const improvementPercent = responseTimeData.improvement_percent || 0;
    
    const botEngagementData = data.bot_engagement || {};
    const botEngagement = botEngagementData.results || [];
    
    const dropoffData = data.calculation_dropoff_rate || {};
    const dropoffRate = dropoffData.average_dropoff_rate || 0;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chatbot Performance Analytics</h2>
          <p className="text-gray-600">Monitor chatbot deployment, testing, and response metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Deployment Rate" value={`${deploymentRate.toFixed(1)}%`} icon={MessageSquare}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600" subtext={`${deployedBots} of ${totalAttempts} attempts`} />
          <MetricCard title="Avg Response Time" value={afterAvg ? `${afterAvg.toFixed(1)}s` : 'N/A'} icon={Zap}
            colorClass="bg-gradient-to-r from-green-500 to-green-600" subtext={improvementPercent ? `${improvementPercent.toFixed(1)}% improvement` : 'No baseline'} />
          <MetricCard title="Test Sessions" value={formatNumber(totalTests)} icon={Activity}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600" subtext={`${successfulTests} successful (${testSuccessRate.toFixed(1)}%)`} />
          <MetricCard title="Conversation Dropoff" value={`${dropoffRate.toFixed(1)}%`} icon={AlertTriangle}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500" subtext="Average dropoff rate" />
        </div>

        {/* Response Time Comparison */}
        {(beforeAvg > 0 || afterAvg > 0) && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Before Optimization</p>
                <p className="text-2xl font-bold text-red-600">{beforeAvg.toFixed(2)}s</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">After Optimization</p>
                <p className="text-2xl font-bold text-green-600">{afterAvg.toFixed(2)}s</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Improvement</p>
                <p className="text-2xl font-bold text-blue-600">{improvementPercent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Common Failure Reasons */}
        {failureReasons.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Deployment Failures</h3>
            <div className="space-y-3">
              {failureReasons.map((reason, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700">{reason._id || reason.reason}</span>
                  <span className="text-red-600 font-semibold">{reason.count} occurrences</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bot Engagement */}
        {botEngagement.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Engagement by User</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Messages</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bot Messages</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bot Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {botEngagement.slice(0, 10).map((engagement, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{engagement.user_id?.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{engagement.total_messages}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{engagement.bot_messages}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          engagement.bot_engagement_rate >= 50 ? 'bg-green-100 text-green-800' :
                          engagement.bot_engagement_rate >= 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>{engagement.bot_engagement_rate?.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bot Testing by User */}
        {botTestingData.by_user && botTestingData.by_user.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Testing Results by User</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Successful</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {botTestingData.by_user.slice(0, 10).map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.userid?.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{user.total_tests}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{user.successful}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{user.failed}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.success_rate >= 80 ? 'bg-green-100 text-green-800' :
                          user.success_rate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>{user.success_rate?.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== BUSINESS METRICS ====================

  const renderBusinessMetrics = () => {
    const data = analyticsData.businessMetrics;
    if (!data) return <div className="text-center py-12 text-gray-500">No business metrics data available</div>;

    const catalogueExtracted = extractData(data.product_catalogue);
    const catalogueData = catalogueExtracted || {};
    const catalogueGrowth = catalogueData.growth || [];
    const catalogueSummary = catalogueData.summary || {};
    
    const revenueExtracted = extractData(data.revenue_attribution);
    const revenueContainer = revenueExtracted?.data || revenueExtracted || {};
    const totalRevenue = revenueContainer.total_revenue || 0;
    const revenueByPlatform = revenueContainer.revenue_by_platform || {};
    const transactionCount = revenueContainer.transaction_count || 0;
    
    const messageExtracted = extractData(data.message_volume_trends);
    const messageTrends = messageExtracted?.data || getDataArray(messageExtracted);
    
    const aovData = data.average_order_value || [];
    const avgOrderValue = aovData.length > 0 ? aovData.reduce((sum, item) => sum + (item.average_order_value || 0), 0) / aovData.length : 0;
    
    const clvData = data.customer_lifetime_value || [];
    
    const churnedRevenueData = data.calculated_churn_revenue || {};
    const churnedRevenue = churnedRevenueData.total_churned_revenue || 0;
    const churnedUsers = churnedRevenueData.total_churned_users || 0;

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Impact Metrics</h2>
          <p className="text-gray-600">Track revenue, catalogue growth, and customer engagement metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Total Revenue" value={`$${formatNumber(totalRevenue)}`} icon={DollarSign}
            colorClass="bg-gradient-to-r from-green-500 to-green-600" subtext={`${transactionCount} transactions`} />
          <MetricCard title="Avg Order Value" value={`$${avgOrderValue.toFixed(2)}`} icon={TrendingUp}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600" subtext={`${aovData.length} users analyzed`} />
          <MetricCard title="Churned Revenue" value={`$${formatNumber(churnedRevenue)}`} icon={AlertTriangle}
            colorClass="bg-gradient-to-r from-red-500 to-red-600" subtext={`${churnedUsers} churned users`} />
          <MetricCard title="Active Customers" value={formatNumber(Array.isArray(clvData) ? clvData.length : 0)} icon={Users}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600" subtext="With lifetime value" />
        </div>

        {/* Catalogue Summary */}
        {catalogueSummary && Object.keys(catalogueSummary).length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catalogue Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Total Products</p>
                <p className="text-2xl font-bold text-blue-600">{catalogueSummary.total_products || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Total Services</p>
                <p className="text-2xl font-bold text-green-600">{catalogueSummary.total_services || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">{catalogueSummary.total_users || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Avg per User</p>
                <p className="text-2xl font-bold text-orange-600">{catalogueSummary.avg_items_per_user?.toFixed(1) || 0}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Channel */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Channel</h3>
            {Object.keys(revenueByPlatform).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={Object.entries(revenueByPlatform).filter(([_, v]) => v > 0).map(([channel, revenue]) => ({ name: channel, value: revenue }))}
                    cx="50%" cy="50%" outerRadius={100} fill="#8B5CF6" dataKey="value"
                    label={({ name, value }) => `${name}: $${formatNumber(value)}`}
                  >
                    {Object.entries(revenueByPlatform).map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `$${formatNumber(value)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">No revenue data available</div>
            )}
          </div>

          {/* Catalogue Growth */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Catalogue Growth</h3>
            {catalogueGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={catalogueGrowth.map(item => ({
                  period: item.period || item.month || 'Unknown',
                  products: item.products || 0,
                  services: item.services || 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="period" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="products" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Products" />
                  <Area type="monotone" dataKey="services" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Services" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">No catalogue data available</div>
            )}
          </div>
        </div>

        {/* Message Volume Trends */}
        {messageTrends.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Volume Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messageTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} name="Messages" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Average Order Value by User */}
        {aovData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Value by User</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {aovData.slice(0, 10).map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username || user._id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.total_orders}</td>
                      <td className="px-4 py-3 text-sm text-green-600">${user.total_revenue?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">${user.average_order_value?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Lifetime Value */}
        {Array.isArray(clvData) && clvData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platforms</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Order Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clvData.slice(0, 10).map((customer, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.username}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.platforms?.join(', ') || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{customer.total_orders}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">${customer.average_order_value?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">${customer.total_revenue?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== USER SUCCESS ====================

  const renderUserSuccess = () => {
    const data = analyticsData.userSuccess;
    if (!data) return <div className="text-center py-12 text-gray-500">No user success data available</div>;

    const repeatExtracted = extractData(data.repeat_customer_interaction);
    const repeatData = getDataArray(repeatExtracted);
    const totalCustomers = repeatData.reduce((sum, u) => sum + (u.total_customers || 0), 0);
    const returningCustomers = repeatData.reduce((sum, u) => sum + (u.returning_customers || 0), 0);
    const repeatRate = totalCustomers > 0 ? (returningCustomers / totalCustomers * 100) : 0;
    
    const retentionExtracted = extractData(data.user_retention);
    const retentionData = getDataArray(retentionExtracted);
    const avgRetention = retentionData.length > 0 ? retentionData.reduce((sum, u) => sum + (u.retention_rate_percent || 0), 0) / retentionData.length : 0;
    
    const timeSaved = data.time_saved_per_user || {};
    const automatedTasks = timeSaved.automated?.count || 0;
    const manualTasks = timeSaved.manual?.count || 0;
    const automationRatio = timeSaved.comparison?.automated_to_manual_ratio || 0;
    const automatedAvgTime = timeSaved.automated?.avg_time_minutes || 0;
    const manualAvgTime = timeSaved.manual?.avg_time_minutes || 0;
    
    const segmentedExtracted = extractData(data.segmented_customers);
    const segmentedData = getDataArray(segmentedExtracted);

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Success Indicators</h2>
          <p className="text-gray-600">Monitor user retention, engagement, and success metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Repeat Customers" value={`${repeatRate.toFixed(1)}%`} icon={Users}
            colorClass="bg-gradient-to-r from-green-500 to-green-600" subtext={`${returningCustomers} of ${totalCustomers} customers`} />
          <MetricCard title="User Retention" value={`${avgRetention.toFixed(1)}%`} icon={TrendingUp}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600" subtext="Average retention rate" />
          <MetricCard title="Automated Tasks" value={formatNumber(automatedTasks)} icon={Zap}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600" subtext={`vs ${manualTasks} manual`} />
          <MetricCard title="Automation Ratio" value={`${automationRatio.toFixed(2)}x`} icon={Activity}
            colorClass="bg-gradient-to-r from-yellow-500 to-orange-500" subtext="Automated to manual" />
        </div>

        {/* Automation Stats */}
        {(automatedTasks > 0 || manualTasks > 0) && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Automation Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Automated Tasks</p>
                <p className="text-2xl font-bold text-green-600">{automatedTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Avg: {automatedAvgTime.toFixed(1)} min</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Manual Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{manualTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Avg: {manualAvgTime.toFixed(1)} min</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Automation Ratio</p>
                <p className="text-2xl font-bold text-purple-600">{automationRatio.toFixed(2)}x</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Time Saved</p>
                <p className="text-2xl font-bold text-orange-600">
                  {((manualAvgTime - automatedAvgTime) * automatedTasks).toFixed(0)} min
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Repeat Customer Breakdown */}
        {repeatData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Repeat Customer Analysis by Platform</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Customers</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returning</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Repeat Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {repeatData.map((platform, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{platform._id || platform.platform}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{platform.total_customers}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{platform.returning_customers}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{platform.new_customers}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          platform.repeat_rate >= 50 ? 'bg-green-100 text-green-800' :
                          platform.repeat_rate >= 25 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>{platform.repeat_rate?.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Retention by User */}
        {retentionData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Retention Details</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sessions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Seen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Seen</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {retentionData.slice(0, 10).map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{user.userid?.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.days_active || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.total_sessions || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.first_seen ? new Date(user.first_seen).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.last_seen ? new Date(user.last_seen).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.retention_rate_percent >= 80 ? 'bg-green-100 text-green-800' :
                          user.retention_rate_percent >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>{user.retention_rate_percent?.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Segmented Customers */}
        {segmentedData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {segmentedData.map((segment, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{segment.segment || segment._id}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Users:</span>
                      <span className="font-medium">{segment.count || segment.user_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Revenue:</span>
                      <span className="font-medium">${segment.avg_revenue?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Orders:</span>
                      <span className="font-medium">{segment.avg_orders?.toFixed(1) || '0'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  // ==================== TECHNICAL PERFORMANCE ====================

  const renderTechnicalPerformance = () => {
    const data = analyticsData.technicalPerformance;
    if (!data) return <div className="text-center py-12 text-gray-500">No technical performance data available</div>;

    const pageLoadExtracted = extractData(data.page_load_times);
    const pageLoadArray = getDataArray(pageLoadExtracted);
    const avgLoadTime = pageLoadArray.length > 0 ? pageLoadArray.reduce((sum, p) => sum + (p.avg_load_time || 0), 0) / pageLoadArray.length : 0;
    const totalEndpointErrors = pageLoadArray.reduce((sum, p) => sum + (p.error_count || 0), 0);
    
    const socialExtracted = extractData(data.social_integration_success);
    const socialData = Array.isArray(socialExtracted) ? socialExtracted[0] : socialExtracted;
    const integrationSuccessRate = socialData?.success_rate || '0%';
    const totalAttempts = socialData?.total_attempts || 0;
    const successCount = socialData?.success_count || 0;
    const failureCount = socialData?.failure_count || 0;
    
    const botLatencySeconds = data.bot_latency?.average_latency_seconds;
    const botLatencySamples = data.bot_latency?.samples || 0;
    
    const errors = data.error_type_breakdown || [];
    const messagesOverTime = data.messages_over_time || [];

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Performance</h2>
          <p className="text-gray-600">Monitor system performance, errors, and integration success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Avg Page Load Time" value={`${avgLoadTime.toFixed(0)}ms`} icon={Zap}
            colorClass="bg-gradient-to-r from-blue-500 to-blue-600" subtext={`${pageLoadArray.length} endpoints tracked`} />
          <MetricCard title="Integration Success" value={integrationSuccessRate} icon={Activity}
            colorClass="bg-gradient-to-r from-green-500 to-green-600" subtext={`${successCount} of ${totalAttempts} attempts`} />
          <MetricCard title="Bot Latency" value={botLatencySeconds ? `${(botLatencySeconds * 1000).toFixed(0)}ms` : 'N/A'} icon={MessageSquare}
            colorClass="bg-gradient-to-r from-purple-500 to-purple-600" subtext={botLatencySamples > 0 ? `${botLatencySamples} samples` : 'No data'} />
          <MetricCard title="Endpoint Errors" value={formatNumber(totalEndpointErrors)} icon={AlertTriangle}
            colorClass="bg-gradient-to-r from-red-500 to-red-600" subtext={`${errors.length} error types`} />
        </div>

        {/* Page Load Times Detail */}
        {pageLoadArray.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Endpoint Performance</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Load Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hits</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error Messages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pageLoadArray.sort((a, b) => b.avg_load_time - a.avg_load_time).slice(0, 15).map((endpoint, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">{endpoint._id || endpoint.endpoint}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          endpoint.avg_load_time > 100 ? 'bg-red-100 text-red-800' :
                          endpoint.avg_load_time > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>{endpoint.avg_load_time?.toFixed(1)}ms</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{endpoint.total_hits}</td>
                      <td className="px-4 py-3 text-sm">
                        {endpoint.error_count > 0 ? (
                          <span className="text-red-600 font-medium">{endpoint.error_count}</span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {endpoint.error_messages && endpoint.error_messages.length > 0 ? (
                          <div className="max-w-xs">
                            {[...new Set(endpoint.error_messages)].slice(0, 2).map((msg, i) => (
                              <span key={i} className="block text-xs text-red-500 truncate">{msg}</span>
                            ))}
                            {[...new Set(endpoint.error_messages)].length > 2 && (
                              <span className="text-xs text-gray-400">+{[...new Set(endpoint.error_messages)].length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Social Integration Details */}
        {socialData && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Integration Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Successful</p>
                <p className="text-2xl font-bold text-green-600">{successCount}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failureCount}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{integrationSuccessRate}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Failure Rate</p>
                <p className="text-2xl font-bold text-orange-600">{socialData?.failure_rate || '0%'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Last Update</p>
                <p className="text-sm font-medium text-gray-700">
                  {socialData.last_update ? new Date(socialData.last_update).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bot Latency Details */}
        {data.bot_latency && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Response Latency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Average Latency</p>
                <p className="text-2xl font-bold text-purple-600">{botLatencySeconds ? `${botLatencySeconds.toFixed(2)}s` : 'N/A'}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">In Milliseconds</p>
                <p className="text-2xl font-bold text-blue-600">{botLatencySeconds ? `${(botLatencySeconds * 1000).toFixed(0)}ms` : 'N/A'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Sample Size</p>
                <p className="text-2xl font-bold text-gray-600">{botLatencySamples}</p>
              </div>
            </div>
            
            {/* Latency Assessment */}
            <div className={`mt-4 p-4 rounded-lg ${
              botLatencySeconds > 10 ? 'bg-red-50 border border-red-200' :
              botLatencySeconds > 5 ? 'bg-yellow-50 border border-yellow-200' :
              'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${
                  botLatencySeconds > 10 ? 'text-red-500' :
                  botLatencySeconds > 5 ? 'text-yellow-500' :
                  'text-green-500'
                }`} />
                <span className={`font-medium ${
                  botLatencySeconds > 10 ? 'text-red-700' :
                  botLatencySeconds > 5 ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {botLatencySeconds > 10 
                    ? 'High latency detected - consider optimizing bot responses' 
                    : botLatencySeconds > 5 
                      ? 'Moderate latency - room for improvement'
                      : 'Good latency performance'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Breakdown */}
        {errors.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Type Breakdown</h3>
            <div className="space-y-3">
              {errors.map((error, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <div>
                    <span className="text-gray-700 font-medium">{error._id || 'Unknown Error'}</span>
                    {error.last_timestamp && (
                      <p className="text-xs text-gray-500 mt-1">Last: {new Date(error.last_timestamp).toLocaleString()}</p>
                    )}
                  </div>
                  <span className="text-red-600 font-semibold bg-red-100 px-3 py-1 rounded-full">{error.count} occurrences</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Over Time */}
        {messagesOverTime.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Volume Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messagesOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8B5CF6" strokeWidth={2} name="Messages" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slowest Endpoints */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">🐢 Slowest Endpoints</h4>
              <div className="space-y-2">
                {pageLoadArray.length > 0 ? (
                  pageLoadArray
                    .sort((a, b) => b.avg_load_time - a.avg_load_time)
                    .slice(0, 5)
                    .map((endpoint, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-mono text-gray-600 truncate max-w-[200px]">{endpoint._id || endpoint.endpoint}</span>
                        <span className={`text-sm font-medium ${endpoint.avg_load_time > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {endpoint.avg_load_time.toFixed(0)}ms
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-gray-500">No endpoint data available</p>
                )}
              </div>
            </div>
            
            {/* Most Error-Prone Endpoints */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">⚠️ Most Error-Prone Endpoints</h4>
              <div className="space-y-2">
                {pageLoadArray.filter(e => e.error_count > 0).length > 0 ? (
                  pageLoadArray
                    .filter(e => e.error_count > 0)
                    .sort((a, b) => b.error_count - a.error_count)
                    .slice(0, 5)
                    .map((endpoint, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-mono text-gray-600 truncate max-w-[200px]">{endpoint._id || endpoint.endpoint}</span>
                        <span className="text-sm font-medium text-red-600">{endpoint.error_count} errors</span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-green-600">No endpoint errors detected ✓</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== CHURN RISK ====================

  const renderChurnRisk = () => {
    const data = analyticsData.churnRisk;
    if (!data) return <div className="text-center py-12 text-gray-500">No churn risk data available</div>;

    const decliningExtracted = extractData(data.declining_usage_patterns);
    const decliningData = decliningExtracted || {};
    const usersAtRisk = decliningData.declining_users_count || 0;
    const totalAnalyzed = decliningData.total_users_analyzed || 0;
    const declineRate = decliningData['decline_rate_%'] || 0;
    
    const loginDropsExtracted = extractData(data.login_frequency_drops);
    const loginData = loginDropsExtracted?.data || loginDropsExtracted || {};
    const inactiveUsers = loginData.inactive_users || [];
    const inactiveCount = loginData.inactive_users_count || 0;
    const inactivePercentage = loginData.inactive_percentage || 0;
    const activeUsersCount = loginData.active_users_count || 0;
    const totalUsersTracked = loginData.total_users_tracked || 0;
    const recentCutoffDays = loginData.recent_cutoff_days || 30;
    
    const silentChurned = data.silent_churned_users || [];
    const featureAbandonmentData = data.feature_abandonment || {};
    const featureAbandonment = featureAbandonmentData.data || [];
    const churnPredictions = data.predict_time_to_churn || [];

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Churn Risk Analysis</h2>
          <p className="text-gray-600">Identify users at risk of churning and take preventive actions</p>
        </div>

        {inactiveCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              {inactiveCount} users showing inactivity ({inactivePercentage.toFixed(1)}% of tracked users)
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Declining Usage */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Usage Patterns</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Analyzed</span>
                <span className="text-xl font-bold text-blue-600">{totalAnalyzed}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium text-gray-700">At Risk</span>
                <span className="text-xl font-bold text-yellow-600">{usersAtRisk}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">Decline Rate</span>
                <span className="text-xl font-bold text-red-600">{declineRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Login Frequency Stats */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Login Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">Active Users</span>
                <span className="text-xl font-bold text-green-600">{activeUsersCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-gray-700">Inactive Users</span>
                <span className="text-xl font-bold text-red-600">{inactiveCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Total Tracked</span>
                <span className="text-xl font-bold text-gray-600">{totalUsersTracked}</span>
              </div>
            </div>
          </div>

          {/* Silent Churned */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">Silent Churn</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="font-medium text-gray-700">Silent Churned</span>
                <span className="text-xl font-bold text-orange-600">{silentChurned.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Cutoff Days</span>
                <span className="text-xl font-bold text-gray-600">{recentCutoffDays}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inactive Users Detail */}
        {inactiveUsers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inactive Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Inactive</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Logins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inactiveUsers.slice(0, 15).map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{user.email || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.days_since_last_login > 30 ? 'bg-red-100 text-red-800' :
                          user.days_since_last_login > 14 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.days_since_last_login} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.total_logins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {inactiveUsers.length > 15 && (
              <p className="text-sm text-gray-500 mt-4">Showing 15 of {inactiveUsers.length} inactive users</p>
            )}
          </div>
        )}

        {/* Churn Predictions */}
        {churnPredictions.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Predictions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Days to Churn</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {churnPredictions.slice(0, 10).map((prediction, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{prediction.email || prediction.userid?.slice(0, 8) || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{prediction.days_to_churn || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prediction.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                          prediction.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {prediction.risk_level || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Churn Risk Distribution Chart */}
        {inactiveUsers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inactivity Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formatInactivityDistribution(inactiveUsers)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="range" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#EF4444" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Feature Abandonment */}
        {featureAbandonment.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Abandonment</h3>
            <div className="space-y-3">
              {featureAbandonment.map((feature, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                  <div>
                    <span className="text-gray-700 font-medium">{feature.feature}</span>
                    <p className="text-xs text-gray-500 mt-1">{feature.users_abandoned} users stopped using</p>
                  </div>
                  <span className="text-orange-600 font-semibold bg-orange-100 px-3 py-1 rounded-full">
                    {feature.abandonment_rate?.toFixed(1)}% abandoned
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Silent Churned Users List */}
        {silentChurned.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Silent Churned Users</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Since Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {silentChurned.slice(0, 10).map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{user.email || user.userid?.slice(0, 8) || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.last_activity ? new Date(user.last_activity).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {user.days_since_activity || 'N/A'} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== DATA FORMATTING FUNCTIONS ====================

  const generateHealthScore = (data) => {
    const onboarding = data.onboarding || {};
    const techPerf = data.technicalPerformance || {};
    const chatbot = data.chatbotPerformance || {};
    const userSuccess = data.userSuccess || {};
    
    const signupRateStr = onboarding.signup_completion_rate?.signup_completion_rate || '0%';
    const signupRate = parsePercentageString(signupRateStr) || 0;
    const activationRate = (onboarding.user_activation_rate?.activation_rate || 0) / 100;
    
    const socialExtracted = extractData(techPerf.social_integration_success);
    const socialData = Array.isArray(socialExtracted) ? socialExtracted[0] : socialExtracted;
    const integrationRate = parsePercentageString(socialData?.success_rate) || 0;
    
    const deploymentRate = (chatbot.chatbot_deployment_rate?.success_rate_percent || 0) / 100;
    
    const retentionExtracted = extractData(userSuccess?.user_retention);
    const retentionArray = getDataArray(retentionExtracted);
    const avgRetention = retentionArray.length > 0 
      ? retentionArray.reduce((sum, u) => sum + (u.retention_rate_percent || 0), 0) / retentionArray.length / 100 
      : 0;
    
    const botTestingExtracted = extractData(chatbot.bot_testing);
    const testSuccessRate = (botTestingExtracted?.overall?.success_rate || 0) / 100;
    
    return [
      { metric: 'Signup Rate', value: Math.round(signupRate * 100) },
      { metric: 'Activation', value: Math.round(activationRate * 100) },
      { metric: 'Integration', value: Math.round(integrationRate * 100) },
      { metric: 'Bot Deploy', value: Math.round(deploymentRate * 100) },
      { metric: 'Retention', value: Math.round(avgRetention * 100) },
      { metric: 'Bot Tests', value: Math.round(testSuccessRate * 100) },
    ];
  };

  const formatPeakUsageData = (peakData) => {
    if (!peakData || !Array.isArray(peakData)) return [];
    
    const hourlyData = {};
    peakData.forEach(item => {
      const hour = item._id?.hour ?? item.hour;
      if (hour !== undefined) {
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sessions: 0, duration: 0 };
        }
        hourlyData[hour].sessions += item.total_sessions || 0;
        hourlyData[hour].duration += item.total_duration || 0;
      }
    });
    
    return Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: `${hour}:00`,
        sessions: data.sessions,
        duration: Math.round(data.duration / 60)
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  };

  const formatInactivityDistribution = (inactiveUsers) => {
    if (!inactiveUsers || !Array.isArray(inactiveUsers)) return [];
    
    const ranges = {
      '0-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '31-60 days': 0,
      '60+ days': 0
    };
    
    inactiveUsers.forEach(user => {
      const days = user.days_since_last_login || 0;
      if (days <= 7) ranges['0-7 days']++;
      else if (days <= 14) ranges['8-14 days']++;
      else if (days <= 30) ranges['15-30 days']++;
      else if (days <= 60) ranges['31-60 days']++;
      else ranges['60+ days']++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  // ==================== LOADING & ERROR STATES ====================
  
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

  // ==================== MAIN RENDER ====================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ConfirmationModal />

      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Admin Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into platform performance and user behavior</p>
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
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'onboarding', label: 'Onboarding', icon: UserCheck },
              { key: 'usage', label: 'Usage Patterns', icon: Activity },
              { key: 'chatbot', label: 'Chatbot', icon: MessageSquare },
              { key: 'business', label: 'Business', icon: TrendingUp },
              { key: 'success', label: 'User Success', icon: Users },
              { key: 'technical', label: 'Technical', icon: Zap },
              { key: 'churn', label: 'Churn Risk', icon: AlertTriangle },
              { key: 'database', label: 'Database', icon: Database },
            ].map(tab => (
              <button 
                key={tab.key}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key 
                    ? tab.key === 'database' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'onboarding' && renderOnboarding()}
          {activeTab === 'usage' && renderUsagePatterns()}
          {activeTab === 'chatbot' && renderChatbotPerformance()}
          {activeTab === 'business' && renderBusinessMetrics()}
          {activeTab === 'success' && renderUserSuccess()}
          {activeTab === 'technical' && renderTechnicalPerformance()}
          {activeTab === 'churn' && renderChurnRisk()}
          {activeTab === 'database' && renderDatabaseManagement()}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;