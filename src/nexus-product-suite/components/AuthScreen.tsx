import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MailIcon, LockIcon, ArrowRightIcon, EyeIcon, CheckCircleIcon, ZapIcon } from './Icons';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Animation state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      if (isLogin) {
        // Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password');
          }
          throw signInError;
        }

        onAuthSuccess();
      } else {
        // Signup
        if (!firstName || !lastName) {
          throw new Error('First name and last name are required');
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: firstName,
              last_name: lastName,
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error('This email is already registered. Please login instead.');
          }
          throw signUpError;
        }

        setSuccessMessage('Account created! Please check your email to verify your account.');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                            {isLogin ? 'Enter your credentials to access your workspace.' : 'Start building amazing products today.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            {!isLogin && (
                              <div className="grid grid-cols-2 gap-3">
                                <div className="relative group">
                                  <input 
                                    type="text" 
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="First name"
                                    required={!isLogin}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                  />
                                </div>
                                <div className="relative group">
                                  <input 
                                    type="text" 
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Last name"
                                    required={!isLogin}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className="relative group">
                                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                                />
                            </div>
                            
                            <div className="relative group">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password (min 6 characters)"
                                    required
                                    minLength={6}
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
                            <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-in fade-in">
                                {error}
                            </div>
                        )}

                        {successMessage && (
                            <div className="text-green-400 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-lg p-3 animate-in fade-in">
                                {successMessage}
                            </div>
                        )}

                        {isLogin && (
                          <div className="flex items-center justify-between text-sm">
                              <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="checkbox" className="w-4 h-4 rounded bg-black/30 border-gray-600 text-blue-600 focus:ring-blue-500" />
                                  <span className="text-gray-400">Remember me</span>
                              </label>
                              <button type="button" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
                          </div>
                        )}

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
