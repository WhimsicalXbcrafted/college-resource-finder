import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/login
 *
 * Authenticates a user using email and password.
 *
 * The request must have a JSON body with the following shape:
 * {
 *   "email": "user@example.com",
 *   "password": "plainTextPassword"
 * }
 *
 * Steps:
 * 1. Parses the JSON body to extract email and password.
 * 2. Validates that both fields are provided.
 * 3. Retrieves the user from the database by email, selecting only the id and hashed password.
 * 4. If the user is not found or the password is missing, returns an error.
 * 5. Compares the provided password with the hashed password using bcrypt.
 * 6. Returns a success message if the password is valid; otherwise, returns an error.
 *
 * @param req - The HTTP request containing JSON credentials.
 * @returns A JSON response indicating success or an appropriate error.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    // Parse the JSON body from the request to extract email and password
    const { email, password } = await req.json();

    // Validate that both email and password are provided
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' },{ status: 400 });
    }

    // Retrieve the user from the database by email, selecting only necessary fields
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    // If no user is found or the password is missing, return an error
    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' },{ status: 400 });
    }

    // If authentication is successful, return a success message
    return NextResponse.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}