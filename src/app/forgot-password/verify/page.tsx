'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  // Prevent double submission in React StrictMode
  const requestInProgressRef = useRef(false);
  const resendRequestRef = useRef(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // No email provided, redirect back
      router.push('/forgot-password');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Prevent double submission (React StrictMode can cause double calls)
    if (requestInProgressRef.current) {
      console.log('[FORGOT_PASSWORD_VERIFY] Prevented double submission of verify request');
      return;
    }
    
    setError('');
    setIsLoading(true);
    requestInProgressRef.current = true;

    try {
      const response = await fetch('/api/auth/password/reset-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      // Redirect to new password page with reset token
      router.push(`/forgot-password/new-password?token=${encodeURIComponent(data.resetToken)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setIsLoading(false);
      requestInProgressRef.current = false;
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    // Prevent double submission (React StrictMode can cause double calls)
    if (resendRequestRef.current) {
      console.log('[FORGOT_PASSWORD_VERIFY] Prevented double submission of resend request');
      return;
    }
    
    setError('');
    resendRequestRef.current = true;
    
    try {
      await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      // Show success message regardless of response
      setError('');
      alert('If your email exists in our system, a new code has been sent.');
    } catch (err) {
      // Silent fail for resend
    } finally {
      resendRequestRef.current = false;
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h1>
        <p className="text-gray-600 mb-6">
          We sent a 6-digit code to <strong>{email}</strong>. 
          Enter it below to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Verification code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 text-center text-lg font-mono tracking-widest"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Didn&apos;t receive a code?</p>
          <button
            onClick={handleResend}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Resend code
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          <Link
            href="/forgot-password"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Loading...</p></div>}>
      <VerifyForm />
    </Suspense>
  );
}