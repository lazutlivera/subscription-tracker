'use client';

import { useEffect } from 'react';
import { handleEmailConfirmation } from '@/utils/supabase';

export default function ConfirmEmail() {
  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#13131A]">
      <div className="bg-[#1C1C27] p-8 rounded-xl shadow-lg">
        <h1 className="text-white text-xl font-semibold mb-4">
          Verifying your email...
        </h1>
        <p className="text-gray-400">
          Please wait while we confirm your email address.
        </p>
      </div>
    </div>
  );
} 