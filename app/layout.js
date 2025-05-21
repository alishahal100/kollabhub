'use client'
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";


export default function RootLayout({ children }) {
  const queryClient = new QueryClient();
  
  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <html lang="en">
          <body className="bg-white text-gray-900">
            
            {children}
            <Toaster />
          </body>
        </html>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
