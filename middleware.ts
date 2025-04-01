import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      if (
        req.nextUrl.pathname.startsWith("/profile") ||
        req.nextUrl.pathname.startsWith("/projects/create") ||
        req.nextUrl.pathname.startsWith("/community/create") ||
        req.nextUrl.pathname.startsWith("/settings")
      ) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/profile/:path*",
    "/projects/create",
    "/community/create",
    "/settings",
  ],
}; 