// src/pages/SettingsPage.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Input, Textarea, Select } from '../components/Form';
import { FaUser, FaLock, FaBell, FaCog, FaBuilding, FaUsers } from 'react-icons/fa';

const SettingsPage: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    timezone: 'America/Chicago',
    language: 'en'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    jobReminders: true,
    invoiceAlerts: true,
    systemUpdates: false
  });
  
  const [organizationSettings, setOrganizationSettings] = useState({
    companyName: 'ProField Services LLC',
    address: '1234 Industrial Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    phone: '512-555-0100',
    email: 'contact@profieldservices.com',
    website: 'www.profieldservices.com',
    taxRate: '8.25',
    currency: 'USD'
  });

  const handleProfileUpdate = () => {
    // TODO: Implement profile update API call
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // TODO: Implement password change API call
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationUpdate = () => {
    // TODO: Implement notification settings update API call
    alert('Notification settings updated successfully!');
  };

  const handleOrganizationUpdate = () => {
    // TODO: Implement organization settings update API call
    alert('Organization settings updated successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser, roles: ['admin', 'manager', 'technician'] },
    { id: 'security', label: 'Security', icon: FaLock, roles: ['admin', 'manager', 'technician'] },
    { id: 'notifications', label: 'Notifications', icon: FaBell, roles: ['admin', 'manager', 'technician'] },
    { id: 'organization', label: 'Organization', icon: FaBuilding, roles: ['admin', 'manager'] },
    { id: 'users', label: 'User Management', icon: FaUsers, roles: ['admin'] },
    { id: 'system', label: 'System', icon: FaCog, roles: ['admin'] }
  ];

  const availableTabs = tabs.filter(tab => tab.roles.includes(user?.role || ''));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and application settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-1/4">
          <Card className="p-4">
            <nav className="space-y-2">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:w-3/4">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                />
                <Select
                  label="Timezone"
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                  options={[
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Chicago', label: 'Central Time' },
                    { value: 'America/Denver', label: 'Mountain Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' }
                  ]}
                />
                <Select
                  label="Language"
                  value={profileData.language}
                  onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' }
                  ]}
                />
              </div>
              <div className="mt-6">
                <Button onClick={handleProfileUpdate} variant="primary">
                  Update Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Change Password</h2>
              <div className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
              <div className="mt-6">
                <Button onClick={handlePasswordChange} variant="primary">
                  Change Password
                </Button>
              </div>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button onClick={handleNotificationUpdate} variant="primary">
                  Update Notifications
                </Button>
              </div>
            </Card>
          )}

          {/* Organization Settings (Admin/Manager only) */}
          {activeTab === 'organization' && ['admin', 'manager'].includes(user?.role || '') && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Organization Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  value={organizationSettings.companyName}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, companyName: e.target.value})}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={organizationSettings.phone}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, phone: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  value={organizationSettings.email}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, email: e.target.value})}
                />
                <Input
                  label="Website"
                  value={organizationSettings.website}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, website: e.target.value})}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={organizationSettings.address}
                    onChange={(e) => setOrganizationSettings({...organizationSettings, address: e.target.value})}
                  />
                </div>
                <Input
                  label="City"
                  value={organizationSettings.city}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, city: e.target.value})}
                />
                <Input
                  label="State"
                  value={organizationSettings.state}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, state: e.target.value})}
                />
                <Input
                  label="ZIP Code"
                  value={organizationSettings.zipCode}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, zipCode: e.target.value})}
                />
                <Input
                  label="Tax Rate (%)"
                  value={organizationSettings.taxRate}
                  onChange={(e) => setOrganizationSettings({...organizationSettings, taxRate: e.target.value})}
                />
              </div>
              <div className="mt-6">
                <Button onClick={handleOrganizationUpdate} variant="primary">
                  Update Organization
                </Button>
              </div>
            </Card>
          )}

          {/* User Management (Admin only) */}
          {activeTab === 'users' && user?.role === 'admin' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
              <div className="space-y-4">
                <Button variant="primary">Add New User</Button>
                <div className="text-sm text-gray-500">
                  User management functionality will be implemented here.
                </div>
              </div>
            </Card>
          )}

          {/* System Settings (Admin only) */}
          {activeTab === 'system' && user?.role === 'admin' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Settings</h2>
              <p className="text-gray-600 mb-4">Configure system-wide settings</p>
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  System configuration options will be implemented here.
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
