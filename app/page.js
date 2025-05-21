'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return; // No user signed in, stay here

    if (user && !user.publicMetadata?.onboarded) {
      router.push('/onboarding');
    } 
    else if (user && user.publicMetadata?.onboarded) {
      if (user.publicMetadata.role === 'creator') {
        router.push('/user-dashboard/');
        // It's better to show alert AFTER routing, not here
      } 
      else if (user.publicMetadata.role === 'brand') {
        router.push('/brand-dashboard/');
      }
    }
  }, [isSignedIn, user, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[#FFF8EC] pt-32">
      
        <h1 className="text-4xl md:text-5xl font-bold text-[#1B5E20] mb-4 leading-tight">
          KollabHub: <br className="hidden md:block" />
          <span className="text-[#F57C00]">Build. Connect. Kollab.</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-md">
          Be one of the first to experience India's top collaboration platform.
        </p>
      </main>
    </>
  );
}
