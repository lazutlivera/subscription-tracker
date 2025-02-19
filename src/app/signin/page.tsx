'use client';
import SignIn from "@/components/auth/Signin";
import { Suspense } from 'react';
import Image from 'next/image';
import logo from '@/assets/brand/logo.png';
import Link from 'next/link';

const SignInPage = () => {
    return (
        <Suspense fallback={<div className="min-h-screen p-8 bg-[#13131A]">Loading...</div>}>
            <div className="min-h-screen p-8 bg-[#13131A]">
                <Link href="/" className="block w-[200px] mx-auto mb-8">
                    <Image 
                        src={logo} 
                        alt="SubsWise" 
                        className="w-full h-auto"
                        priority
                    />
                </Link>
                <SignIn />
            </div>
        </Suspense>
    );
  };
  
export default SignInPage;
