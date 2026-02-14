import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [fullName, setFullName] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/StudentDashboard';
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        const result = await register(email, password, fullName);
        if (result.success) {
          navigate(redirectUrl, { replace: true });
        } else {
          setError(result.error || 'An account with this email already exists. Please sign in.');
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          navigate(redirectUrl, { replace: true });
        } else {
          setError(result.error || 'Invalid email or password. Please try again or create an account.');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0066CC' }}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ALO Education</span>
          </Link>
          <p className="mt-3 text-slate-600">
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Create your account to get started'}
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your details to create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                style={{ backgroundColor: '#0066CC' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <p className="text-slate-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('register'); setError(''); }}
                    className="font-semibold hover:underline"
                    style={{ color: '#0066CC' }}
                  >
                    Create one
                  </button>
                </p>
              ) : (
                <p className="text-slate-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('login'); setError(''); }}
                    className="font-semibold hover:underline"
                    style={{ color: '#0066CC' }}
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            {/* Admin quick access hint */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Admin? Use your admin credentials to access the CRM dashboard.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in, you agree to ALO Education's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
