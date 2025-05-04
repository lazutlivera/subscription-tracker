'use client';

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from "@/utils/supabase";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { signIn, isLoading: isAuthLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
     
    const urlMessage = searchParams?.get('message');
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: formData.email,
          });

          if (resendError) throw resendError;

          setError('Please check your email to verify your account. A new verification email has been sent.');
          return;
        }
        throw error;
      }

      if (data?.user) {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) return <div>Loading...</div>;
  if (isSubmitting) return <div>Signing in...</div>;

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {message && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-600 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div id="error-message" className="mb-4 p-3 bg-red-500/10 border border-red-500 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-white">
              Email
            </label>
            <input
              name="email"
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full rounded-lg border-0 bg-gray-800 p-3 text-white shadow-sm focus:ring-2 focus:ring-[#6C5DD3]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-white">
              Password
            </label>
            <input
              name="password"
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="block w-full rounded-lg border-0 bg-gray-800 p-3 text-white shadow-sm focus:ring-2 focus:ring-[#6C5DD3]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#6C5DD3] hover:text-[#5B4EC2]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 