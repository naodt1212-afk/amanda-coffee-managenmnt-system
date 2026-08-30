import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button, Input } from '../components/UI';
import { Coffee, Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowLeft } from 'lucide-react';
import { AmandaLogo } from '../components/AmandaLogo';

export const AdminLogin: React.FC = () => {
  const { login, navigateTo, showToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    // Simulate network delay before checking login
    setTimeout(async () => {
      try {
        const success = await login(email, password);
        if (!success) {
          setError('Invalid login credentials. Double-check your details.');
        }
      } catch (err) {
        setError('Connection failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };

  // Demo shortcut credentials selection
  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row relative">
      {/* Visual Accent Column */}
      <div className="w-full md:w-1/2 bg-amber-950 text-white flex flex-col justify-between p-8 md:p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-amber-900/30 to-amber-950/95 z-0" />
        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800')] bg-cover z-0" />

        <div className="relative z-10 flex items-center justify-between">
          <button 
            onClick={() => navigateTo('customer-menu')} 
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition"
          >
            <ArrowLeft size={16} /> Back to Customer Page
          </button>
          <AmandaLogo variant="horizontal" size="xs" light />
        </div>

        <div className="relative z-10 my-12 md:my-auto">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-extrabold block mb-2">
            Staff Portal
          </span>
          <div className="flex flex-col items-start gap-4">
            <AmandaLogo variant="badge" size="md" className="!items-start shadow-xl border border-[#D4A373]/20" />
            <h2 className="font-display text-3xl font-black leading-tight mt-2 text-white">
              AMANDA COFFEE <br />
              <span className="text-stone-300 font-light font-sans text-xl md:text-2xl">Café Management System</span>
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-4 leading-relaxed max-w-sm">
            Access secure POS ordering, real-time kitchen queues, table layouts, stock management, and financial reporting modules.
          </p>
        </div>

        <div className="relative z-10 text-[10px] text-stone-500">
          © 2026 AMANDA COFFEE • Addis Ababa, Ethiopia • v2.4.0-POS
        </div>
      </div>

      {/* Main Form Column */}
      <div className="w-full md:w-1/2 bg-stone-50 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="font-display text-2xl font-bold text-stone-900">Sign In</h3>
            <p className="text-xs text-stone-400 mt-1">Enter your assigned staff email address and password below</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl p-3 mb-5 flex items-start gap-2 animate-shake">
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email Address"
              placeholder="e.g. cashier@amanda.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
            />

            <div className="relative w-full">
              <Input
                id="password"
                label="Security Password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[38px] text-stone-400 hover:text-stone-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-stone-500 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1A120B] focus:ring-[#D4A373] border-stone-300 w-4 h-4"
                />
                Remember my terminal
              </label>
              <span className="text-[#D4A373] hover:underline cursor-pointer">Forgot?</span>
            </div>

            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              className="w-full py-3 mt-4"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Quick Switching Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                Testing Accounts Panel
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@amanda.com')}
                className="text-[11px] text-stone-600 hover:text-amber-900 bg-stone-100 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40 text-left font-medium transition"
              >
                🔑 Admin
              </button>
              <button
                onClick={() => handleQuickLogin('manager@amanda.com')}
                className="text-[11px] text-stone-600 hover:text-amber-900 bg-stone-100 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40 text-left font-medium transition"
              >
                💼 Manager
              </button>
              <button
                onClick={() => handleQuickLogin('cashier@amanda.com')}
                className="text-[11px] text-stone-600 hover:text-amber-900 bg-stone-100 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40 text-left font-medium transition"
              >
                💵 Cashier
              </button>
              <button
                onClick={() => handleQuickLogin('waiter@amanda.com')}
                className="text-[11px] text-stone-600 hover:text-amber-900 bg-stone-100 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40 text-left font-medium transition"
              >
                🍽️ Waiter
              </button>
              <button
                onClick={() => handleQuickLogin('kitchen@amanda.com')}
                className="text-[11px] text-stone-600 hover:text-amber-900 bg-stone-100 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg border border-stone-200/40 text-left font-medium transition"
              >
                🍳 Kitchen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
