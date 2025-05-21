'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';

const RedirectLogic = () => {
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) return; // No signed in user yet

    if (user && !user.publicMetadata?.onboarded) {
      router.push('/onboarding');
    } 
    else if (user && user.publicMetadata?.onboarded && user.publicMetadata?.role === 'creator') {
      router.push('/user-dashboard');
      // ❌ Don't use alert inside useEffect (not good UX). 
      // Instead show a toast or modal on dashboard page itself.
    }
  }, [isSignedIn, user, router]);

  return null;
};

export default RedirectLogic;
