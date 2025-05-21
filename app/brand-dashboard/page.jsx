'use client';

import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Sidebar } from '@/components/ui/sidebar';

const Page = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log(user);
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center" id='home'>
      hello user
      </div>
    </div>
  );
};

export default Page;
