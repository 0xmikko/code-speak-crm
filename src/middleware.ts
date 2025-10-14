import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional logic can be added here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages
        if (pathname.startsWith('/auth')) {
          return true;
        }

        // Allow access to root page
        if (pathname === '/') {
          return true;
        }

        // For protected routes, check if user is authenticated and valid
        if (pathname.startsWith('/assets') ||
            pathname.startsWith('/protocols') ||
            pathname.startsWith('/lps') ||
            pathname.startsWith('/users')) {
          return token?.isValidUser === true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};