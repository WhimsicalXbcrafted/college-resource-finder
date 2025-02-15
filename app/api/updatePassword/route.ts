import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; 
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route'; 
import bcrypt from 'bcryptjs'; 

/**
 * POST request handler to update a user's password.
 * 
 * This function performs the following actions:
 * 1. Validates the user's session to ensure they are logged in.
 * 2. Verifies that the current password provided matches the stored password.
 * 3. Hashes the new password before storing it securely.
 * 4. Updates the user's password in the database.
 * 
 * @param {Request} req - The HTTP request containing the user's current and new password.
 * @returns {NextResponse} - A JSON response indicating the outcome of the password update.
 */
export async function POST(req: Request) {
  try {
    // Retrieve the session from NextAuth
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse the request body to get the current and new password
    const { currentPassword, newPassword } = await req.json();

    // Find the user from the database using the authenticated user's ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // If the user doesn't exist, return a 404 response
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Compare the current password with the stored password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password!);

    // If the current password is incorrect, return a 401 response
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash the new password before saving it in the database
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    // Return a success response after the password is updated
    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging and return a failure response
    console.error('Password update error:', error);

    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}