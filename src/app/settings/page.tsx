'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { format } from 'date-fns';
import { validatePassword } from '@/utils/validation';

export default function Settings() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [userMetadata, setUserMetadata] = useState<{
    created_at?: string;
    last_sign_in?: string;
  }>({});
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (data) {
        setFormData(prev => ({ ...prev, fullName: data.full_name }));
      }

      // Get user metadata
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserMetadata({
          created_at: userData.user.created_at,
          last_sign_in: userData.user.last_sign_in_at,
        });
      }
    };

    loadProfile();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      // Update name
      if (formData.fullName) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: formData.fullName })
          .eq('id', user!.id);

        if (profileError) throw profileError;
      }

      // Update password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ text: 'Passwords do not match', type: 'error' });
          return;
        }

        const { isValid, error } = validatePassword(formData.newPassword);
        if (!isValid) {
          setMessage({ text: error, type: 'error' });
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (passwordError) throw passwordError;
        setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      }

      setMessage({ text: 'Settings updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to update settings', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#13131A] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-0">Account Settings</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded mb-4 ${
            message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-[#1C1C27] rounded-xl p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2 text-gray-400">
            <p>Email: {user?.email}</p>
            <p>Member since: {userMetadata.created_at ? format(new Date(userMetadata.created_at), 'MMMM d, yyyy') : 'N/A'}</p>
            <p>Last login: {userMetadata.last_sign_in ? format(new Date(userMetadata.last_sign_in), 'MMMM d, yyyy HH:mm') : 'N/A'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1C1C24] rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg p-3"
              placeholder="Leave blank to keep current password"
            />
            <p className="mt-1 text-sm text-gray-400">
              Password must be at least 8 characters long and contain uppercase, lowercase, and numbers
            </p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#6C5DD3] hover:bg-[#5B4EC2] text-white rounded-lg p-3 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
} 