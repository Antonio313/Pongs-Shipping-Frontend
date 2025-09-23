import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from '../../src/Header';
import Footer from '../../src/Footer';

function CustomerSettings() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    branch: user?.branch || ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const generateAddress = (selectedBranch, currentAddress = '') => {
    if (!selectedBranch) return currentAddress || '';

    // Handle null/undefined currentAddress
    const safeCurrentAddress = currentAddress || '';

    // Fixed Address 1 for all users
    const address1 = '3132 NW 43rd Street';

    // Extract user ID from current address
    let userIdNumber = '';
    const pscMatch = safeCurrentAddress.match(/PSC\s+\w+\s+(\d+)/);
    if (pscMatch) {
      userIdNumber = pscMatch[1]; // Get the captured user ID number
    } else if (user?.user_id) {
      // If we can't extract from address, use the user ID from context
      userIdNumber = user.user_id < 10 ? `0${user.user_id}` : `${user.user_id}`;
    } else {
      // If we can't extract the user ID and no user context, return the current address
      return safeCurrentAddress;
    }

    // Generate new address with updated branch and user ID
    return `${address1}, PSC ${selectedBranch} ${userIdNumber}`;
  };

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      const newProfileData = {
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        address: user.address || '',
        branch: user.branch || ''
      };
      setProfileData(newProfileData);
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };

      // Auto-generate address when branch changes
      if (name === 'branch') {
        newData.address = generateAddress(value, prev.address);
      }

      return newData;
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      // Include the auto-generated address in the update
      const updateData = {
        ...profileData,
        address: generateAddress(profileData.branch, profileData.address)
      };
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/customer/profile`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessage('Profile updated successfully!');
        // Update the user context with the new user data
        updateUser(response.data.user);
        // Clear any existing errors
        setError('');
        // Clear the success message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
      setMessage(''); // Clear any success message on error
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/customer/profile/password`,
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setMessage('Password updated successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        // Clear any existing errors
        setError('');
        // Clear the success message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(response.data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'Failed to update password');
      setMessage(''); // Clear any success message on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
            <p className="text-xl text-blue-100">Manage your account preferences and security</p>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Messages */}
          {message && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Password & Security
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Update Profile Information</h3>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pickup Branch
                        </label>
                        <select
                          name="branch"
                          value={profileData.branch}
                          onChange={handleProfileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select Branch</option>
                          <option value="Priory">Priory</option>
                          <option value="Ocho Rios">Ocho Rios</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="address"
                        value={profileData.address}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                        placeholder="Auto-generated address"
                        disabled
                        readOnly
                      />
                      <p className="mt-1 text-sm text-gray-500">Address is automatically generated and cannot be changed.</p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading && (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        Update Profile
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'password' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        minLength={6}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Must be at least 6 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {loading && (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        Update Password
                      </button>
                    </div>
                  </form>

                  {/* Security Information */}
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Use a strong, unique password for your account</li>
                      <li>• Include a mix of letters, numbers, and symbols</li>
                      <li>• Don't share your password with anyone</li>
                      <li>• Consider using a password manager</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/customer/profile"
                className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">View Profile</p>
                  <p className="text-sm text-gray-600">See your profile information</p>
                </div>
              </a>

              <a
                href="/customerDashboard"
                className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Dashboard</p>
                  <p className="text-sm text-gray-600">Return to main dashboard</p>
                </div>
              </a>

              <a
                href="/customerDashboard?tab=prealerts"
                className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Create Pre-Alert</p>
                  <p className="text-sm text-gray-600">Add a new package shipment</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CustomerSettings;