import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Handles user authentication via email and password.
 *
 * @param {Request} req - The HTTP request object containing JSON credentials.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse JSON body from the request
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Retrieve the user from the database
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true }, // Only fetch necessary fields
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid email or password '}, {status: 400})
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, {status: 400})
    }

    // Respond with a success message
    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}