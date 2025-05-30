import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest, res: NextResponse) {
  const pathname = req.nextUrl.pathname;
  const session = req.cookies.get("_nova_session");
  const isNew = req.cookies.get("isNew")?.value === "true";
  const accessCodeFromParams = pathname.split("@")[1];
  const validAccessCode = "frixeth";

  const unprotectedRoutes = ["/login"];

  const response = NextResponse.next();

  // Allow access to Next.js assets
  if (pathname.includes("/_next")) {
    return NextResponse.next();
  }

  if (pathname.includes("/@")) {
    const response = NextResponse.redirect(new URL("/login", req.url));

    response.cookies.set("_access_code", accessCodeFromParams, {
      path: "/",
      maxAge: 10,
    });

    return response;
  }

  if (isNew) {
    // Check if the user is coming from the login page
    if (pathname === "/login") {
      return NextResponse.next();
    }

    // If the user is new and not on the login page, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If user is already logged in and trying to access login page, redirect to home
  if (session && pathname === "/login" && !isNew) {
    // Check if there's a destination param to redirect to
    // if (!req.nextUrl.searchParams.has("d")) {
    //   const destination = req.nextUrl.searchParams.get("d") || "/";
    //   return NextResponse.redirect(new URL(destination, req.url));
    // }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow access to unprotected routes
  if (unprotectedRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Redirect to login if no session
  if (!session) {
    // if (!req.nextUrl.searchParams.has("d")) {
    //   return NextResponse.redirect(
    //     new URL(`/login?d=${req.nextUrl.searchParams.get("d")}`, req.url),
    //   );
    // }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /static (public files)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|static|.*\\.[^\\s]*$).*)",
  ],
};
