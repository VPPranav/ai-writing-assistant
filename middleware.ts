import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Add CORS headers to allow requests from any origin
  const response = NextResponse.next()

  // Add headers to ensure proper error handling
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Ensure content type is set to JSON for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Content-Type", "application/json")
  }

  return response
}

// Configure the middleware to run for API routes
export const config = {
  matcher: "/api/:path*",
}
