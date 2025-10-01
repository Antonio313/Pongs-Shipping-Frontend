import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import Header from '../../src/Header';
import Footer from '../../src/Footer';
import { superAdminAPI } from '../../services/api';
import { ROLES, ROLE_NAMES } from '../../utils/rolePermissions';

function SuperAdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(null);
  const [staffPerformance, setStaffPerformance] = useState(null);
  const [systemOverview, setSystemOverview] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [activityLog, setActivityLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  // Auto-refresh for real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      // Only refresh if we're on the staff performance tab
      if (activeSection === 'staff') {
        loadDashboardData();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [activeSection]);

  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = location.hash.substring(1) || window.location.hash.substring(1); // Remove the '#'
      const validSections = ['overview', 'staff', 'analytics', 'management', 'activity'];
      if (hash && validSections.includes(hash)) {
        setActiveSection(hash);
      } else if (!hash) {
        setActiveSection('overview'); // Default to overview if no hash
      }
    };

    // Check hash on component mount and location change
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [location]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, performanceRes, overviewRes, revenueRes, activityRes] = await Promise.allSettled([
        superAdminAPI.getDashboardData(),
        superAdminAPI.getStaffPerformance(selectedPeriod),
        superAdminAPI.getSystemOverview(),
        superAdminAPI.getRevenueAnalytics(selectedPeriod),
        superAdminAPI.getActivityLog(20)
      ]);

      if (dashboardRes.status === 'fulfilled') setDashboardData(dashboardRes.value.data);
      if (performanceRes.status === 'fulfilled') setStaffPerformance(performanceRes.value.data);
      if (overviewRes.status === 'fulfilled') setSystemOverview(overviewRes.value.data);
      if (revenueRes.status === 'fulfilled') setRevenueAnalytics(revenueRes.value.data);
      if (activityRes.status === 'fulfilled') setActivityLog(activityRes.value.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `JM$${parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Mobile-Responsive Header Section */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Super Admin Dashboard</h1>
                <p className="text-purple-100 text-sm sm:text-base">Complete system oversight and management</p>
              </div>
              <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-3 py-2 border border-white/30 w-full sm:w-auto"
                >
                  <option value="7" className="text-gray-900">Last 7 days</option>
                  <option value="30" className="text-gray-900">Last 30 days</option>
                  <option value="90" className="text-gray-900">Last 90 days</option>
                </select>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center md:text-left w-full sm:w-auto">
                  <p className="text-sm">Welcome, {user?.first_name} {user?.last_name}</p>
                  <p className="text-sm">Role: Super Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Mobile-Responsive Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6 sm:mb-8">
            {/* Mobile Tab Navigation - Stacked Button Style */}
            <div className="sm:hidden border-b border-gray-200">
              <div className="grid grid-cols-2 gap-1 p-2">
                {[
                  { id: 'overview', label: 'Overview', icon: '📊' },
                  { id: 'staff', label: 'Staff Performance', icon: '👥' },
                  { id: 'analytics', label: 'Analytics', icon: '📈' },
                  { id: 'management', label: 'Management', icon: '⚙️' },
                  { id: 'activity', label: 'Activity Log', icon: '📋' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveSection(tab.id);
                      window.location.hash = tab.id;
                    }}
                    className={`px-3 py-3 font-semibold text-xs transition-all duration-300 rounded-lg ${
                      activeSection === tab.id
                        ? 'text-purple-600 bg-purple-50 border-2 border-purple-200'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{tab.icon}</span>
                      <span className="leading-tight">{tab.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:flex border-b overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'staff', label: 'Staff Performance', icon: '👥' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'management', label: 'Management', icon: '⚙️' },
                { id: 'activity', label: 'Activity Log', icon: '📋' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSection(tab.id);
                    window.location.hash = tab.id;
                  }}
                  className={`px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeSection === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6">
              {/* Overview Section */}
              {activeSection === 'overview' && dashboardData && (
                <div className="space-y-6">
                  {/* Mobile-Responsive Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
                      <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(dashboardData.totalStats.total_revenue)}</p>
                      <p className="text-xs sm:text-sm opacity-75">Today: {formatCurrency(dashboardData.todayStats.revenue_today)}</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl">
                      <h3 className="text-sm font-medium opacity-90">Total Packages</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{dashboardData.totalStats.total_packages}</p>
                      <p className="text-xs sm:text-sm opacity-75">Today: {dashboardData.todayStats.packages_today}</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl">
                      <h3 className="text-sm font-medium opacity-90">Total Customers</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{dashboardData.totalStats.total_customers}</p>
                      <p className="text-xs sm:text-sm opacity-75">Today: {dashboardData.todayStats.customers_today}</p>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 sm:p-6 rounded-xl">
                      <h3 className="text-sm font-medium opacity-90">Active Staff</h3>
                      <p className="text-2xl sm:text-3xl font-bold">{dashboardData.totalStats.total_staff}</p>
                      <p className="text-xs sm:text-sm opacity-75">Active: {dashboardData.activeStaff}</p>
                    </div>
                  </div>

                  {/* Mobile-Responsive System Overview */}
                  {systemOverview && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {/* Package Status Distribution */}
                      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold mb-4">Package Status Distribution</h3>
                        <div className="space-y-3">
                          {systemOverview.packagesByStatus.map(status => (
                            <div key={status.status} className="flex justify-between items-center">
                              <span className="text-sm font-medium">{status.status}</span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {status.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Customer Verification by Branch */}
                      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                        <h3 className="text-base sm:text-lg font-semibold mb-4">Customer Verification by Branch</h3>
                        <div className="space-y-3">
                          {systemOverview.customersByBranch.map(branch => (
                            <div key={branch.branch} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{branch.branch}</span>
                                <span className="text-sm text-gray-600">
                                  {branch.verified}/{branch.total} verified
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${(branch.verified / branch.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Recent System Activity</h3>
                    <div className="space-y-3">
                      {dashboardData.recentActivity.slice(0, 5).map(activity => (
                        <div key={activity.log_id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(activity.created_at)} • {activity.action_type}
                              {activity.revenue_impact > 0 && (
                                <span className="ml-2 text-green-600 font-medium">
                                  +{formatCurrency(activity.revenue_impact)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile-Responsive Staff Performance Section */}
              {activeSection === 'staff' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Staff Performance Analytics</h2>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Period:</span>
                        <select
                          value={selectedPeriod}
                          onChange={(e) => setSelectedPeriod(e.target.value)}
                          className="border border-gray-300 rounded px-3 py-1 text-sm min-w-[120px]"
                        >
                          <option value="7">Last 7 days</option>
                          <option value="30">Last 30 days</option>
                          <option value="90">Last 90 days</option>
                        </select>
                      </div>
                      <button
                        onClick={() => loadDashboardData()}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 w-full sm:w-auto"
                      >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-sm sm:text-base">{loading ? 'Refreshing...' : 'Refresh'}</span>
                      </button>
                    </div>
                  </div>

                  {staffPerformance && staffPerformance.staffSummary && staffPerformance.staffSummary.length > 0 ? (
                    <>
                      {/* Real-time Performance Summary */}
                      <div className="mb-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">Live Data</span>
                        {staffPerformance.generatedAt && (
                          <span className="text-xs text-gray-500">
                            Updated {new Date(staffPerformance.generatedAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {staffPerformance.staffSummary.map(staff => (
                      <div key={staff.staff_id} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{staff.first_name} {staff.last_name}</h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm text-gray-600">{staff.branch} Branch</p>
                              {staff.last_activity && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(staff.total_revenue)}</p>
                            <p className="text-xs text-gray-500">Revenue Generated</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xl font-bold text-blue-600">{staff.packages_processed || 0}</p>
                            <p className="text-xs text-gray-600">Packages</p>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <p className="text-xl font-bold text-purple-600">{staff.prealerts_confirmed || 0}</p>
                            <p className="text-xs text-gray-600">Pre-alerts</p>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <p className="text-xl font-bold text-orange-600">{staff.transfers_created || 0}</p>
                            <p className="text-xs text-gray-600">Transfers</p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Actions:</span>
                            <span className="font-medium">{staff.total_actions || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Avg per Action:</span>
                            <span className="font-medium">{formatCurrency(staff.avg_revenue_per_action || 0)}</span>
                          </div>
                          {staff.last_activity && (
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-600">Last Active:</span>
                              <span className="font-medium text-green-600">
                                {new Date(staff.last_activity).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                      </div>

                      {/* Real-time Activity Feed */}
                      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4">
                          <h3 className="text-base sm:text-lg font-semibold">Live Activity Feed</h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-600">Real-time</span>
                          </div>
                        </div>
                        {staffPerformance.recentActivity && staffPerformance.recentActivity.length > 0 ? (
                          <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                            {staffPerformance.recentActivity.slice(0, 20).map(activity => (
                              <div key={activity.log_id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                                <div className="flex-shrink-0">
                                  {activity.action_type === 'package_status_update' && (
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 text-sm">📦</span>
                                    </div>
                                  )}
                                  {activity.action_type === 'prealert_confirmation' && (
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 text-sm">✅</span>
                                    </div>
                                  )}
                                  {activity.action_type === 'transfer_creation' && (
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-purple-600 text-sm">🚚</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {activity.first_name} {activity.last_name}
                                    </p>
                                    <div className="text-right flex-shrink-0 ml-2">
                                      {activity.revenue_impact > 0 && (
                                        <p className="text-sm font-semibold text-green-600">
                                          +{formatCurrency(activity.revenue_impact)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500">
                                      {activity.branch} • {activity.action_type.replace('_', ' ')}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(activity.created_at).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="mb-4">
                              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <p className="text-gray-500">No activity yet. Actions will appear here in real-time.</p>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data Yet</h3>
                      <p className="text-gray-500 mb-4">
                        Staff performance data will appear here once your team starts processing packages, confirming pre-alerts, and creating transfers.
                      </p>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>• Package status updates</p>
                        <p>• Pre-alert confirmations</p>
                        <p>• Transfer list creation</p>
                        <p>• Customer management</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile-Responsive Analytics Section */}
              {activeSection === 'analytics' && revenueAnalytics && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Revenue Analytics</h2>

                  {/* Revenue by Branch */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Revenue by Branch</h3>
                    <div className="space-y-4">
                      {revenueAnalytics.branchRevenue.map(branch => {
                        const maxRevenue = Math.max(...revenueAnalytics.branchRevenue.map(b => parseFloat(b.revenue)));
                        const percentage = (parseFloat(branch.revenue) / maxRevenue) * 100;

                        return (
                          <div key={branch.branch} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{branch.branch}</span>
                              <div className="text-right">
                                <span className="font-bold text-green-600">{formatCurrency(branch.revenue)}</span>
                                <span className="text-sm text-gray-600 ml-2">({branch.package_count} packages)</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Daily Revenue Trend - Mobile Optimized */}
                  <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold mb-4">Daily Revenue Trend</h3>
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[300px]">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 sm:px-0 text-sm sm:text-base">Date</th>
                            <th className="text-left py-2 px-2 sm:px-0 text-sm sm:text-base">Packages</th>
                            <th className="text-left py-2 px-2 sm:px-0 text-sm sm:text-base">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueAnalytics.dailyRevenue.slice(0, 10).map(day => (
                            <tr key={day.date} className="border-b border-gray-100">
                              <td className="py-2 px-2 sm:px-0 text-sm sm:text-base">{new Date(day.date).toLocaleDateString()}</td>
                              <td className="py-2 px-2 sm:px-0 text-sm sm:text-base">{day.package_count}</td>
                              <td className="py-2 px-2 sm:px-0 text-sm sm:text-base font-semibold text-green-600">{formatCurrency(day.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Management Section */}
              {activeSection === 'management' && (
                <ManagementSection onUpdate={loadDashboardData} />
              )}

              {/* Mobile-Responsive Activity Log Section */}
              {activeSection === 'activity' && activityLog && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">System Activity Log</h2>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Description</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityLog.activities.map(activity => (
                            <tr key={activity.log_id} className="border-b border-gray-100">
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{formatDate(activity.created_at)}</td>
                              <td className="px-2 sm:px-4 py-3">
                                <div>
                                  <p className="font-medium text-xs sm:text-sm">{activity.first_name} {activity.last_name}</p>
                                  <p className="text-xs text-gray-500">{activity.branch}</p>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <span className="px-1 sm:px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {activity.action_type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm max-w-xs truncate hidden sm:table-cell">{activity.description}</td>
                              <td className="px-2 sm:px-4 py-3">
                                {activity.revenue_impact > 0 && (
                                  <span className="text-green-600 font-semibold text-xs sm:text-sm">
                                    +{formatCurrency(activity.revenue_impact)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Management Section Component
function ManagementSection({ onUpdate }) {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaffList, setFilteredStaffList] = useState([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staffList, searchTerm, roleFilter, branchFilter]);

  const loadStaff = async () => {
    try {
      const response = await superAdminAPI.getAllStaff();
      // Filter out customers from the staff list
      const staffOnly = response.data.filter(staff => staff.role !== ROLES.CUSTOMER);
      setStaffList(staffOnly);
    } catch (error) {
      console.error('Error loading staff:', error);
    }
  };

  const filterStaff = () => {
    let filtered = [...staffList];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(staff =>
        staff.first_name.toLowerCase().includes(searchLower) ||
        staff.last_name.toLowerCase().includes(searchLower) ||
        staff.email.toLowerCase().includes(searchLower) ||
        staff.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(staff => staff.role === roleFilter);
    }

    // Branch filter
    if (branchFilter !== 'all') {
      filtered = filtered.filter(staff => staff.branch === branchFilter);
    }

    setFilteredStaffList(filtered);
  };

  const handleDeleteStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await superAdminAPI.deleteStaff(staffId);
      loadStaff();
      onUpdate();
      alert('Staff member deleted successfully');
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(error.response?.data?.message || 'Failed to delete staff member');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Staff Management</h2>
        <button
          onClick={() => setShowAddStaffModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 w-full sm:w-auto"
        >
          Add New Staff
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">All Roles</option>
              <option value={ROLES.SUPER_ADMIN}>{ROLE_NAMES[ROLES.SUPER_ADMIN]}</option>
              <option value={ROLES.ADMIN}>{ROLE_NAMES[ROLES.ADMIN]}</option>
              <option value={ROLES.CASHIER}>{ROLE_NAMES[ROLES.CASHIER]}</option>
              <option value={ROLES.PACKAGE_HANDLER}>{ROLE_NAMES[ROLES.PACKAGE_HANDLER]}</option>
              <option value={ROLES.TRANSFER_PERSONNEL}>{ROLE_NAMES[ROLES.TRANSFER_PERSONNEL]}</option>
              <option value={ROLES.FRONT_DESK}>{ROLE_NAMES[ROLES.FRONT_DESK]}</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Branch</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">All Branches</option>
              <option value="Priory">Priory</option>
              <option value="Spanish Town">Spanish Town</option>
              <option value="May Pen">May Pen</option>
              <option value="Portmore">Portmore</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredStaffList.length} of {staffList.length} staff members
        </div>
      </div>

      {/* Mobile-Responsive Staff List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Email</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || roleFilter !== 'all' || branchFilter !== 'all'
                      ? 'No staff members match your filters'
                      : 'No staff members found'}
                  </td>
                </tr>
              ) : (
                filteredStaffList.map(staff => (
                <tr key={staff.user_id} className="border-b border-gray-100">
                  <td className="px-2 sm:px-4 py-3">
                    <div>
                      <p className="font-medium text-sm sm:text-base">{staff.first_name} {staff.last_name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{staff.phone}</p>
                      <p className="text-xs text-gray-500 sm:hidden">{staff.email}</p>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-sm hidden sm:table-cell">{staff.email}</td>
                  <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm">{staff.branch}</td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                      staff.role === ROLES.SUPER_ADMIN
                        ? 'bg-purple-100 text-purple-800'
                        : staff.role === ROLES.ADMIN
                        ? 'bg-blue-100 text-blue-800'
                        : staff.role === ROLES.CASHIER
                        ? 'bg-green-100 text-green-800'
                        : staff.role === ROLES.PACKAGE_HANDLER
                        ? 'bg-orange-100 text-orange-800'
                        : staff.role === ROLES.TRANSFER_PERSONNEL
                        ? 'bg-indigo-100 text-indigo-800'
                        : staff.role === ROLES.FRONT_DESK
                        ? 'bg-teal-100 text-teal-800'
                        : staff.role === ROLES.CUSTOMER
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ROLE_NAMES[staff.role] || staff.role}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                      staff.is_verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {staff.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <button
                      onClick={() => handleDeleteStaff(staff.user_id, `${staff.first_name} ${staff.last_name}`)}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2 sm:px-3 py-1 rounded transition-all duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <AddStaffModal
          onClose={() => setShowAddStaffModal(false)}
          onSuccess={() => {
            loadStaff();
            onUpdate();
            setShowAddStaffModal(false);
          }}
        />
      )}
    </div>
  );
}

// Add Staff Modal Component
function AddStaffModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    branch: 'Priory',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await superAdminAPI.createStaff(formData);
      onSuccess();
      alert('Staff member added successfully');
    } catch (error) {
      console.error('Error adding staff:', error);
      alert(error.response?.data?.message || 'Failed to add staff member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Add New Staff Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
              <select
                required
                value={formData.branch}
                onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Priory">Priory</option>
                <option value="Ocho Rios">Ocho Rios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Select a role...</option>
                <option value={ROLES.SUPER_ADMIN}>{ROLE_NAMES[ROLES.SUPER_ADMIN]}</option>
                <option value={ROLES.ADMIN}>{ROLE_NAMES[ROLES.ADMIN]}</option>
                <option value={ROLES.CASHIER}>{ROLE_NAMES[ROLES.CASHIER]}</option>
                <option value={ROLES.PACKAGE_HANDLER}>{ROLE_NAMES[ROLES.PACKAGE_HANDLER]}</option>
                <option value={ROLES.TRANSFER_PERSONNEL}>{ROLE_NAMES[ROLES.TRANSFER_PERSONNEL]}</option>
                <option value={ROLES.FRONT_DESK}>{ROLE_NAMES[ROLES.FRONT_DESK]}</option>
                <option value={ROLES.CUSTOMER}>{ROLE_NAMES[ROLES.CUSTOMER]}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{loading ? 'Adding...' : 'Add Staff Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;