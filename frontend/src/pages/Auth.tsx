import { useState } from 'react'
import { api, UserOut } from '../api'
import { useUser } from '../UserContext'
import { LogIn, UserPlus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import clsx from 'clsx'

export function AuthPage() {
  const { setUser } = useUser()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [college, setCollege]   = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'register') {
        await api.auth.register({ name, email, password, college })
        // After register, auto login
      }
      
      const { access_token } = await api.auth.login({ email, password })
      localStorage.setItem('token', access_token)
      
      const user = await api.users.me()
      localStorage.setItem('tl_user', JSON.stringify(user))
      setUser(user)
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (e: string, p: string) => {
    setEmail(e)
    setPassword(p)
    setMode('login')
    // Small delay to show the animation
    setTimeout(() => {
        const btn = document.getElementById('auth-submit')
        btn?.click()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent-blue/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-[440px] z-10 animate-fade-in">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center mb-6 shadow-xl shadow-primary/5 border border-primary/20 group hover:scale-105 transition-transform duration-500">
             <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/30">T</div>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-text-main mb-2">TradeLab</h1>
          <p className="text-text-muted font-medium flex items-center gap-2">
            Professional Grade Paper Trading <Sparkles size={16} className="text-primary" />
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface rounded-[40px] shadow-2xl p-10 md:p-12 border border-border-subtle relative overflow-hidden">
          <div className="flex p-1.5 bg-background-light rounded-2xl mb-8 border border-border-subtle shadow-inner">
            <button 
              onClick={() => setMode('login')}
              className={clsx(
                "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all",
                mode === 'login' ? "bg-surface text-primary shadow-md" : "text-text-muted hover:text-text-main"
              )}
            >
              Sign In
            </button>
            <button 
              onClick={() => setMode('register')}
              className={clsx(
                "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all",
                mode === 'register' ? "bg-surface text-primary shadow-md" : "text-text-muted hover:text-text-main"
              )}
            >
              Register
            </button>
          </div>

          <div className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-5 animate-slide-up">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <input 
                    className="w-full h-14 px-5 bg-background-light border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main placeholder:text-text-muted/40"
                    placeholder="Enter your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">College / University</label>
                  <input 
                    className="w-full h-14 px-5 bg-background-light border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main placeholder:text-text-muted/40"
                    placeholder="e.g. KSIT Tech"
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 animate-slide-up">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email"
                className="w-full h-14 px-5 bg-background-light border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main placeholder:text-text-muted/40"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2 animate-slide-up">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Secure Password</label>
              <input 
                type="password"
                className="w-full h-14 px-5 bg-background-light border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-bold text-text-main placeholder:text-text-muted/40"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-loss text-xs font-bold text-center py-2 bg-loss/5 rounded-xl border border-loss/10">{error}</p>}

            <button 
              id="auth-submit"
              onClick={handleAuth}
              disabled={loading}
              className="w-full h-16 bg-primary text-white font-black text-base rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Access Trading Desk' : 'Create Trading Account'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-border-subtle">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck size={16} className="text-primary" />
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Quick Access Demo Users</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { n: 'Pranav', e: 'pranav@tradelab.app' },
                { n: 'Mithil', e: 'mithil@tradelab.app' },
                { n: 'Supreeth', e: 'supreeth@tradelab.app' },
              ].map(demo => (
                <button 
                  key={demo.e}
                  onClick={() => quickLogin(demo.e, 'f4wOCTsc9O')}
                  className="py-2.5 bg-background-light hover:bg-surface hover:shadow-md border border-border-subtle rounded-xl text-[10px] font-black text-text-main transition-all"
                >
                  {demo.n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-text-muted">
          By continuing, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>
        </p>
      </div>
    </div>
  )
}
