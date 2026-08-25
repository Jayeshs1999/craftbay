import { NextRequest, NextResponse } from "next/server";

const PRIVATE_PREFIXES = ["/dashboard", "/checkout", "/wishlist", "/seller", "/become-seller"];
const AUTH_PAGES       = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("jwt")?.value;

  // Logged-in user visits login/register -> send to dashboard
  if (token && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated user visits private route -> send to login
  const isPrivate = PRIVATE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPrivate && !token) {
    return NextResponse.redirect(
      new URL("/login?redirect=" + encodeURIComponent(pathname), request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};