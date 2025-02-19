'use client';
import SignIn from "@/components/auth/Signin";
import { Suspense } from 'react';

const SignInPage = () => {
    return (
        <Suspense fallback={<div className="min-h-screen p-8 bg-[#13131A]">Loading...</div>}>
            <div className="min-h-screen p-8 bg-[#13131A]">
                <SignIn />
            </div>
        </Suspense>
    );
  };
  
export default SignInPage;
