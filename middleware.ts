import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple basic middleware just to match the structure
  const response = NextResponse.next()
  return response
}

export const config = {
  matcher: '/api/:path*',
}
