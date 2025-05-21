'use client';

import { UserButton, useUser, SignInButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Brands', href: '#' },
    { name: 'Creators', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-[#FFF8EC] shadow-md fixed top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image src="/logo.png" alt="KollabHub Logo" width={40} height={40} />
       
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center space-x-6 text-[#1B5E20] font-medium">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} className="hover:text-[#F57C00] transition">
            {link.name}
          </Link>
        ))}
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className="bg-[#1B5E20] text-white px-4 py-2 rounded-full hover:bg-[#164D1A] transition">
              Sign In
            </button>
          </SignInButton>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
        <svg className="w-6 h-6 text-[#1B5E20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 w-64 h-full bg-[#FFF8EC] shadow-lg z-50 px-6 py-8 flex flex-col space-y-6"
          >
            <button onClick={() => setIsOpen(false)} className="self-end text-2xl text-[#1B5E20]">&times;</button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-lg text-[#1B5E20] hover:text-[#F57C00] transition"
              >
                {link.name}
              </Link>
            ))}
            {isSignedIn ? (
              <div className="flex items-center space-x-4">

              <button  className=' rounded-3xl px-10 py-3' > dashboard</button>
              <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="bg-[#1B5E20] text-white px-4 py-2 rounded-full hover:bg-[#164D1A] transition">
                  Sign In
                </button>
              </SignInButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
