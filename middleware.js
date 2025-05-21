import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  // Get auth instance once and reuse it
  const authInstance = auth();
  const { userId } = authInstance;

  // Skip middleware for public routes
  if (
    !userId || 
    req.nextUrl.pathname.startsWith('/onboarding') || 
    req.nextUrl.pathname.startsWith('/api')
  ) {
    return;
  }

  // Get user from the same auth instance
  const user = await authInstance.user;
  const isOnboarded = user?.publicMetadata?.onboarded;

  // Redirect non-onboarded users
  if (!isOnboarded) {
    const url = req.nextUrl.clone();
    url.pathname = '/onboarding';
    return Response.redirect(url);
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};