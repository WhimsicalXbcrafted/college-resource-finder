import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { isUWEmail } from '@/app/utils/emailValidator';
import bcrypt from 'bcryptjs'; 

/**
 * POST request handler to create a new user.
 * 
 * This function performs the following actions:
 * 1. Validates that the provided email belongs to a UW domain (@uw.edu).
 * 2. Checks if the user already exists in the database.
 * 3. Hashes the provided password for secure storage.
 * 4. Creates a new user in the database with the provided email and hashed password.
 * 
 * @param {Request} req - The HTTP request containing the user's email and password.
 * @returns {NextResponse} - A JSON response indicating the outcome of the user creation.
 */
export async function POST(req: Request) {
  try {
    // Parse the request body for email and password
    const { email, password } = await req.json();

    // Check if the email is a valid UW email address
    if (!isUWEmail(email)) {
      return NextResponse.json(
        { error: 'Please use a UW email address (@uw.edu)' },
        { status: 400 }
      );
    }

    // Check if a user already exists with the given email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // If the user already exists, return an error response
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // Return a success response indicating user creation
    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    // Log the error for debugging and return a failure response
    console.error('User creation error:', error);

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
