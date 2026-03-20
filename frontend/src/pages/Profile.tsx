import React, { useState, useEffect } from 'react'
import { api, UserOut } from '../api'
import { useUser } from '../UserContext'
import { Camera, MapPin, User, Mail, GraduationCap, Edit2, Check, X } from 'lucide-react'

export default function Profile() {
  const { user, setUser } = useUser()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [college, setCollege] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setCollege(user.college || '')
    }
  }, [user])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const updated = await api.users.update({ name, bio, college })
      setUser(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const updated = await api.users.uploadPhoto(file)
    setUser(updated)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center p-20">
        <p className="text-white/50">Please login to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header */}
      <div className="relative group">
        <div className="h-48 rounded-3xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 blur-xl absolute inset-0 -z-10" />
        <div className="glass-panel p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/20 bg-white/5 group-hover:border-blue-500/50 transition-colors shadow-2xl">
              {user.profile_photo ? (
                <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5">
                  <User size={48} className="text-white/20" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 text-white cursor-pointer hover:bg-blue-500 transition-all hover:scale-110 shadow-lg border border-white/20">
              <Camera size={16} />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
              {user.name}
              {user.college && <span className="text-sm font-normal py-1 px-3 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">Scholar</span>}
            </h1>
            <p className="text-white/60 flex items-center justify-center md:justify-start gap-2">
              <Mail size={14} /> {user.email}
            </p>
            {user.college && (
              <p className="text-white/60 flex items-center justify-center md:justify-start gap-2">
                <GraduationCap size={14} /> {user.college}
              </p>
            )}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all flex items-center gap-2 font-medium"
          >
            {editing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">About Me</h2>
            
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/50 ml-1">Full Name</label>
                  <input
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50 ml-1">College/Institution</label>
                  <input
                    value={college}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCollege(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="e.g. IIT Madras"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/50 ml-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button
                  disabled={saving}
                  onClick={handleUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? "Saving..." : <><Check size={20} /> Save Changes</>}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-white/80 leading-relaxed italic">
                  {user.bio || "No bio added yet. Tell us about your trading journey!"}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex-1 min-w-[140px]">
                    <p className="text-white/30 text-xs uppercase tracking-wider font-bold mb-1">Joined</p>
                    <p className="text-white text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex-1 min-w-[140px]">
                    <p className="text-white/30 text-xs uppercase tracking-wider font-bold mb-1">Status</p>
                    <p className="text-blue-400 text-sm flex items-center gap-1.5 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Active Trader
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <div className="glass-panel p-6 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Trading Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-white/50">Experience</span>
                <span className="text-white font-medium">Novice</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-white/50">Risk Profile</span>
                <span className="text-yellow-400 font-medium">Moderate</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50">Strategy</span>
                <span className="text-green-400 font-medium">Swing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
