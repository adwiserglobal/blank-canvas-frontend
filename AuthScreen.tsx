
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MailIcon, LockIcon, ArrowRightIcon, EyeIcon, CheckCircleIcon, ZapIcon } from './Icons';

interface AuthScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Animation state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const foundUser = users.find(u => u.id === 'user-alex'); // Default fallback for demo
      
      if (email && password.length < 4) {
          setError("Password must be at least 4 characters");
          setIsLoading(false);
          return;
      }

      // In a real app, we would validate credentials. 
      // For this demo, we accept any email/password or default to Alex if empty for convenience, 
      // but let's try to match the email if provided.
      
      // Mock email matching logic
      const userByEmail = users.find(u => u.name.toLowerCase().replace(' ', '.') + '@nexus.app' === email.toLowerCase());
      
      if (email && !userByEmail && password) {
           // Allow "fake" login for demo purposes if it's a new email
           // In a real app this would error.
      }

      if (foundUser) {
        onLogin(userByEmail || foundUser);
      } else {
        setIsLoading(false);
        setError("Invalid credentials");
      }
    }, 1500);
  };

  const handleQuickLogin = (user: User) => {
      setIsLoading(true);
      setTimeout(() => {
          onLogin(user);
      }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className={`w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 z-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Left Side: Brand & Info */}
        <div className="hidden lg:flex flex-col justify-center p-8 space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                    <ZapIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Nexus</h1>
            </div>
            
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">
                Build products <br/> that matter.
            </h2>
            
            <p className="text-lg text-gray-400 max-w-md leading-relaxed">
                The all-in-one workspace for engineering, product, and design teams to move faster together.
            </p>

            <div className="flex gap-4 mt-8">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md w-40">
                    <p className="text-3xl font-bold text-blue-400">10x</p>
                    <p className="text-sm text-gray-400 mt-1">Faster Workflow</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-md w-40">
                    <p className="text-3xl font-bold text-purple-400">100%</p>
                    <p className="text-sm text-gray-400 mt-1">Collaboration</p>
                </div>
            </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-[#121214]/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
                {/* Gradient Border Top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {isLogin ? 'Enter your credentials to access your workspace.' : 'Start your 14-day free trial today.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative group">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            
                            <div className="relative group">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2 animate-in fade-in">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded bg-black/30 border-gray-600 text-blue-600 focus:ring-blue-500" />
                                <span className="text-gray-400">Remember me</span>
                            </label>
                            <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Get Started'}
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative py-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#18181b] px-2 text-xs text-gray-500 uppercase tracking-wider">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Mock */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl py-2.5 transition-all">
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                            <span className="text-sm font-medium text-gray-300">GitHub</span>
                        </button>
                         <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl py-2.5 transition-all">
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            <span className="text-sm font-medium text-gray-300">Google</span>
                        </button>
                    </div>

                    {/* Quick Login Demo */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-xs text-gray-500 font-bold uppercase mb-3 text-center">Demo: Quick Login As</p>
                        <div className="flex justify-center gap-3">
                            {users.slice(0, 4).map(u => (
                                <button 
                                    key={u.id} 
                                    onClick={() => handleQuickLogin(u)}
                                    className="group relative"
                                    title={`Login as ${u.name}`}
                                >
                                    <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-blue-500 transition-all" />
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <ArrowRightIcon className="w-4 h-4 text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span className="text-blue-400 font-medium">{isLogin ? 'Sign Up' : 'Log In'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full text-xs text-gray-600">
        © 2025 Nexus Product Suite. Designed for world-class teams.
      </div>
    </div>
  );
};
