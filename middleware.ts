import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Client-side layout handles authentication via localStorage
  // This middleware just allows all requests through
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

