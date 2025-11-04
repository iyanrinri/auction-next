import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PUT')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'PATCH')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return proxyRequest(request, path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Build the full path
    const path = pathSegments.join('/')
    
    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams.toString()
    const queryString = searchParams ? `?${searchParams}` : ''
    
    // Build the backend URL
    const backendUrl = `${BACKEND_URL}/${path}${queryString}`
    
    // Get headers from the original request
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Forward important headers, skip host-related headers
      if (
        !key.startsWith('host') &&
        !key.startsWith('x-forwarded') &&
        !key.startsWith('x-real-ip') &&
        key !== 'connection'
      ) {
        headers[key] = value
      }
    })
    
    // Get body for POST, PUT, PATCH requests
    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.text()
      } catch (error) {
        // If body parsing fails, continue without body
      }
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body || undefined,
    })
    
    // Get response data
    const data = await response.text()
    
    // Create response with same status and headers
    const proxyResponse = new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
    })
    
    // Copy response headers
    response.headers.forEach((value, key) => {
      // Skip headers that should not be forwarded
      if (
        !key.startsWith('content-encoding') &&
        !key.startsWith('transfer-encoding') &&
        key !== 'connection'
      ) {
        proxyResponse.headers.set(key, value)
      }
    })
    
    return proxyResponse
  } catch (error: any) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { 
        error: 'Proxy Error', 
        message: error.message || 'Failed to connect to backend API',
        path: pathSegments.join('/')
      },
      { status: 502 }
    )
  }
}
