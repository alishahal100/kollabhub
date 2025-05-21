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
        
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-lg">{user.emailAddresses[0].emailAddress}</p>
        <p className="text-lg">{user.id}</p>
        <img src={user.imageUrl} alt=" " className='w-20 rounded-3xl' />
        <p className="text-lg">
          {user.publicMetadata.onboarded ? 'Onboarded' : 'Not Onboarded'}
        </p>
      </div>
      <div className="flex flex-col items-center justify-center" id='about'>
        
        
        <img src={user.imageUrl} alt=" " className='w-20 rounded-3xl' />
        <p className="text-lg">
          {user.publicMetadata.onboarded ? 'Onboarded' : 'Not Onboarded'}
        </p>
      </div>
    </div>
  );
};

export default Page;
