import { NextResponse } from 'next/server'

const API = process.env.DJANGO_API_URL || 'http://127.0.0.1:8000'

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      )
    }

    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '')

    const response = await fetch(`${API}/api/v1/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: name,
        username,
        email,
        password,
        confirm_password: password,
      }),
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.detail || data.message || 'Registration failed', details: data },
        { status: response.status }
      )
    }

    return NextResponse.json({ success: true, message: data.message || 'Registration successful' })
  } catch {
    return NextResponse.json({ error: 'Unable to connect to the registration service' }, { status: 500 })
  }
}
