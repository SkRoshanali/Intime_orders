'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Prevent double submission in React StrictMode
  const requestInProgressRef = useRef(false);

  const returnUrl = searchParams.get('returnUrl') || '/';
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission (React StrictMode can cause double calls)
    if (requestInProgressRef.current) {
      console.log('[LOGIN] Prevented double submission of login request');
      return;
    }
    
    setError('');
    setIsLoading(true);
    requestInProgressRef.current = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      // Redirect
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
      requestInProgressRef.current = false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message === 'password-updated' && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              Password updated successfully! Please log in with your new password.
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          New user?{' '}
          <Link
            href={`/register${returnUrl !== '/' ? `?returnUrl=${returnUrl}` : ''}`}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Register
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-gray-600">
          <Link
            href="/forgot-password"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}