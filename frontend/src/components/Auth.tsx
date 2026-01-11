import React, { useState } from 'react';
import { UserRole } from '../types/refTypes';
import { Mail, Lock, User } from 'lucide-react';
import { authAPI } from '../services/api';

interface AuthProps {
  onLogin: (user: { id?: string; name: string; email?: string; role: UserRole; avatar: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(email, password);
      } else {
        response = await authAPI.register(name, email, password);
      }

      if (response.user) {
        onLogin({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as UserRole,
          avatar: response.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(response.user.name)}&background=14b8a6&color=fff`,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    // TODO: Implement Google OAuth
    setError('Google authentication not yet implemented');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200">
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-teal-500 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                <img src="/grovyn.png" alt="GROVYN" className="w-full h-full object-contain p-1" />
              </div>
              <span className="text-2xl font-black tracking-tighter">GROVYN</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter leading-none mb-6">
              Architecting the <br />Future of Fintech.
            </h1>
            <p className="text-teal-50 font-medium max-w-sm leading-relaxed">
              Precision engineering for modern commerce. Secure, compliant, and infinitely scalable.
            </p>
          </div>
          <div className="relative z-10 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">System Status: Optimal</span>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-80 italic">
              "We design and build systems with long-term ownership in mind. Architecture is not an afterthought."
            </p>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 lg:p-20 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {isLogin ? 'Access Portal' : 'Onboard Node'}
              </h2>
              <p className="text-slate-500 font-medium mt-2">
                {isLogin ? 'Enter your credentials to manage architecture.' : 'Create your system identifier.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Identity Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-teal-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Identifier (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-teal-500 outline-none transition-all"
                    placeholder="architect@grovyn.io"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Key (Password)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    name="password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-teal-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs font-bold text-teal-600 hover:text-teal-700">Recover Key?</button>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-600 shadow-xl shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Processing Node...' : isLogin ? 'Initialize Session' : 'Create Identity'}
              </button>
            </form>

            <div className="mt-10">
              <div className="relative mb-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs uppercase font-black tracking-widest text-slate-400">
                  <span className="bg-white px-4">Or Secure Login with</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleGoogleAuth} 
                  disabled={loading}
                  className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold text-slate-700 disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>
              </div>
            </div>

            <p className="mt-10 text-center text-sm font-medium text-slate-500">
              {isLogin ? "No identity yet?" : "Already have a node?"} {' '}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-teal-600 font-bold hover:underline"
              >
                {isLogin ? 'Request Access' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
