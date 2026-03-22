import React, { useState } from 'react';
import { User, Bell, Shield, Wallet, Trash2, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils';

interface SettingsProps {
  profile: any;
  onUpdateProfile: (data: any) => Promise<void>;
  onResetPortfolio: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile, onResetPortfolio }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'security' | 'account'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Form states
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    tradeConfirmations: true,
    weeklyReport: false,
    marketing: false
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await onUpdateProfile({ name, bio });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      await onResetPortfolio();
      setShowResetConfirm(false);
    } catch (error) {
      console.error('Failed to reset portfolio:', error);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Wallet },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-main">Settings</h2>
        <p className="text-sm text-muted mt-1">Manage your account preferences and security settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold",
                activeSection === section.id
                  ? "bg-brand-primary/10 text-brand-primary"
                  : "text-muted hover:bg-surface-hover hover:text-main"
              )}
            >
              <section.icon className="w-4.5 h-4.5" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card-base p-6 lg:p-8">
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-main mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-bg-main border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full bg-bg-main border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all resize-none"
                      placeholder="Tell us about your trading style..."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {saveStatus === 'success' && (
                    <span className="text-emerald-400 text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Changes saved
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-red-400 text-sm flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Failed to save
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-main mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-bg-main border border-border">
                    <div>
                      <p className="text-sm font-bold text-main capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Receive updates about your {key.toLowerCase()} activity.
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                      className={cn(
                        "w-11 h-6 rounded-full transition-all duration-200 relative",
                        value ? "bg-brand-primary" : "bg-border"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200",
                        value ? "left-6" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-main mb-4">Security Settings</h3>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex gap-4">
                <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-400">Two-Factor Authentication</p>
                  <p className="text-xs text-emerald-400/70 mt-1">
                    Your account is currently protected by Google Authentication. No additional steps are required.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-main border border-border">
                  <div>
                    <p className="text-sm font-bold text-main">Session Management</p>
                    <p className="text-xs text-muted mt-0.5">View and manage your active trading sessions.</p>
                  </div>
                  <button className="text-xs font-bold text-brand-primary hover:underline">View All</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'account' && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-bold text-main mb-4">Account Management</h3>
              
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-red-500/10 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-400">Reset Portfolio</p>
                    <p className="text-xs text-red-400/70 mt-1 leading-relaxed">
                      This will permanently delete all your trade history, reset your balance to $100,000, and remove your current positions. This action cannot be undone.
                    </p>
                    
                    {!showResetConfirm ? (
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-all"
                      >
                        Reset My Portfolio
                      </button>
                    ) : (
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                        >
                          Confirm Reset
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-4 py-2 bg-surface-hover text-muted rounded-lg text-xs font-bold hover:text-main transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
