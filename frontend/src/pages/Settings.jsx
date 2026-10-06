import React, { useState, useRef } from 'react';
import { useERP } from '../context/ERPContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Shield,
  Briefcase,
  Bell,
  Laptop,
  Check,
  Save,
  LogOut,
  Lock,
  Phone,
  Mail,
  Building,
  RotateCcw,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

export const Settings = () => {
  const { settings, setSettings, showToast, resetToMockData } = useERP();
  const { user, logout, updateUser, changePassword } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeSection, setActiveSection] = useState('profile'); // profile, security, cases, notifications, system

  // Local editable copies
  const [profileData, setProfileData] = useState({
    adminName: user?.name || settings?.profile?.adminName || 'Senior Adv. R. Jayaraman',
    role: user?.role || settings?.profile?.role || 'Managing Partner',
    email: user?.email || settings?.profile?.email || 'admin@layererp.legal',
    mobile: user?.mobile || settings?.profile?.mobile || '9840011223',
    barCouncilNo: settings?.profile?.barCouncilNo || 'MS/1084/1998',
    officeAddress: settings?.profile?.officeAddress || 'No. 42, Law Chambers, High Court Complex, Chennai - 600104',
    profileImage: user?.avatar || settings?.profile?.profileImage || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'
  });
  const [securityData, setSecurityData] = useState(settings?.security || {});
  const [notificationData, setNotificationData] = useState(settings?.notifications || {});
  const [systemData, setSystemData] = useState(settings?.system || {});

  // Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Handle Admin Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      setProfileData((prev) => ({ ...prev, profileImage: base64Image }));
      updateUser({ avatar: base64Image });
      showToast('Admin profile photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    const defaultAvatar = 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80';
    setProfileData((prev) => ({ ...prev, profileImage: defaultAvatar }));
    updateUser({ avatar: defaultAvatar });
    showToast('Admin profile photo reset to default.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSettings((prev) => ({ ...prev, profile: profileData }));
    updateUser({
      name: profileData.adminName,
      email: profileData.email,
      mobile: profileData.mobile,
      role: profileData.role,
      avatar: profileData.profileImage
    });
    showToast('Admin profile details updated successfully.');
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match.', 'error');
        return;
      }
      if (!currentPassword) {
        showToast('Please enter your current password.', 'error');
        return;
      }
      setPasswordLoading(true);
      const res = await changePassword(currentPassword, newPassword);
      setPasswordLoading(false);
      if (res && res.success) {
        showToast('Admin password changed successfully! Use your new password to login next time.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res?.error || 'Current password incorrect.', 'error');
        return;
      }
    }
    setSettings((prev) => ({ ...prev, security: securityData }));
    showToast('Security preferences updated.');
  };

  const handleToggleNotification = (key) => {
    const updated = {
      ...notificationData,
      [key]: !notificationData[key]
    };
    setNotificationData(updated);
    setSettings((prev) => ({ ...prev, notifications: updated }));
    showToast('Notification preference toggled.');
  };

  const handleToggleSecurity = (key) => {
    const updated = {
      ...securityData,
      [key]: !securityData[key]
    };
    setSecurityData(updated);
    setSettings((prev) => ({ ...prev, security: updated }));
    showToast('Security parameter updated.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'profile', label: 'Chamber Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'cases', label: 'Legal Master Lists', icon: Briefcase },
    { id: 'notifications', label: 'WhatsApp & Alerts', icon: Bell },
    { id: 'system', label: 'System & Preferences', icon: Laptop },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Practice Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure chamber details, alert triggers, case master tables, and user preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar Navigation */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-card p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                  isActive
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={() => resetToMockData()}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-navy-900 transition-colors text-left"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Reset Sample Data
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Settings Cards Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: PROFILE */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-navy-900">Admin Profile & Chamber Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Admin identification displayed on topbar profile card and fee receipts</p>
                </div>
              </div>

              {/* Admin Profile Card Live Preview */}
              <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-navy-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative group w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white/20 shadow-inner bg-slate-800 shrink-0">
                      <img
                        src={profileData.profileImage || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=200&auto=format&fit=crop&q=80'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-navy-900/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1 cursor-pointer"
                        title="Upload New Photo"
                      >
                        <Camera className="w-4 h-4" />
                        Change
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-lg font-black tracking-tight">{profileData.adminName}</h4>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Chamber Admin
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-400" /> +91 {profileData.mobile}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-400" /> {profileData.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer ring-1 ring-blue-400/40"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo</span>
                    </button>
                    {profileData.profileImage && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-2 text-slate-300 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-white/10"
                        title="Reset to default photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {profileData.officeAddress && (
                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300 flex items-start gap-2">
                    <Building className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{profileData.officeAddress}</span>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {/* Editable Admin Fields */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Admin / Advocate Full Name"
                      required
                      placeholder="e.g. Senior Adv. R. Jayaraman"
                      value={profileData.adminName || ''}
                      onChange={(e) => setProfileData({ ...profileData, adminName: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Phone Number"
                      required
                      placeholder="e.g. 9840011223"
                      value={profileData.mobile || ''}
                      onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                    />
                    <Input
                      label="Official Email ID"
                      type="email"
                      required
                      placeholder="e.g. admin@layererp.legal"
                      value={profileData.email || ''}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Office / Chamber Address
                    </label>
                    <textarea
                      rows={3}
                      value={profileData.officeAddress || ''}
                      onChange={(e) => setProfileData({ ...profileData, officeAddress: e.target.value })}
                      placeholder="Enter chamber / office street address..."
                      className="w-full rounded-xl border border-slate-300 focus:ring-navy-600 focus:border-navy-600 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-1 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <Button type="submit" variant="primary" icon={Save}>
                    Save Profile Card
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* SECTION 2: SECURITY */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy-900">Security & Access Controls</h3>
                <p className="text-xs text-slate-500 mt-0.5">Change your admin password and security protocols</p>
              </div>

              {/* Password change form */}
              <form onSubmit={handleSaveSecurity} className="space-y-4 pb-6 border-b border-slate-100">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Change Admin Login Password</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" icon={Lock} disabled={passwordLoading}>
                    {passwordLoading ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </div>
              </form>

              {/* Security Toggles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Authentication Safeguards</h4>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">Two-Factor Authentication (2FA)</span>
                    <span className="text-[11px] text-slate-500">Require OTP confirmation on unfamiliar devices</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSecurity('twoFactorAuth')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      securityData.twoFactorAuth ? 'bg-navy-900' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        securityData.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">Audit Activity Logging</span>
                    <span className="text-[11px] text-slate-500">Log every junior case access, fee deletion and record edit</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleSecurity('auditLog')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      securityData.auditLog ? 'bg-navy-900' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        securityData.auditLog ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: LEGAL MASTER LISTS */}
          {activeSection === 'cases' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-card p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy-900">Legal Master Tables</h3>
                <p className="text-xs text-slate-500 mt-0.5">Predefined courts, case categories and hearing stages</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Recognized Courts / Tribunals</h4>
                  <div className="flex flex-wrap gap-2">
                    {(settings?.caseSettings?.courts || []).map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Practice Case Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {(settings?.caseSettings?.caseTypes || []).map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg text-xs font-semibold border border-blue-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">Hearing Stages & Sequences</h4>
                  <div className="flex flex-wrap gap-2">
                    {(settings?.caseSettings?.hearingTypes || []).map((h, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: NOTIFICATIONS */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-card p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy-900">WhatsApp & Notification System</h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure client reminders, junior briefing triggers, and alerts</p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">WhatsApp Hearing Reminders</span>
                    <span className="text-[11px] text-slate-500">Enable one-click client WhatsApp dispatch from hearing schedule</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotification('hearingReminderWhatsapp')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      notificationData.hearingReminderWhatsapp ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notificationData.hearingReminderWhatsapp ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">2 Days Before Hearing Alert</span>
                    <span className="text-[11px] text-slate-500">Auto-flag upcoming listings 48 hours prior for junior brief prep</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotification('twoDaysBefore')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      notificationData.twoDaysBefore ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notificationData.twoDaysBefore ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">1 Day Before Hearing Alert</span>
                    <span className="text-[11px] text-slate-500">Prompt client reminder banner 24 hours before court date</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotification('oneDayBefore')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      notificationData.oneDayBefore ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notificationData.oneDayBefore ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-xs font-bold text-navy-900 block">Payment Receipt SMS</span>
                    <span className="text-[11px] text-slate-500">Acknowledge fee receipt via text SMS to client mobile</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleNotification('paymentReceiptSms')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      notificationData.paymentReceiptSms ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notificationData.paymentReceiptSms ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SYSTEM */}
          {activeSection === 'system' && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-card p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-navy-900">System Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Localization, currency format and practice year</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="ERP Theme" value="Dark Navy / Light Clean Legal" readOnly />
                <Input label="Currency" value="INR (₹) – Indian Rupee" readOnly />
                <Input label="Date Format" value="DD MMM YYYY (e.g. 08 Oct 2026)" readOnly />
                <Input label="Fiscal Practice Year" value="01 April – 31 March" readOnly />
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-navy-900">Reset Local ERP State</h4>
                  <p className="text-xs text-slate-500">Restore factory sample cases, juniors, and hearings</p>
                </div>
                <Button variant="outline" size="sm" icon={RotateCcw} onClick={resetToMockData}>
                  Reset All Mock Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
