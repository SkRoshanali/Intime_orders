'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { User, Phone, Mail, CheckCircle, LogOut } from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?returnUrl=/account');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Invalidate all queries
      queryClient.clear();

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen pb-20 bg-gray-50">
        <div className="max-w-[480px] mx-auto">
          <div className="bg-white p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Account</h1>
          </div>

          <div className="p-4 space-y-4">
            {/* User Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 py-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{user.phone}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-white text-red-600 border border-red-600 py-3 rounded-lg font-medium hover:bg-red-50 min-h-[44px]"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
